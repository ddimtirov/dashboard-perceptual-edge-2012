@Grab(group='org.vert-x', module='vertx-lang-groovy', version='1.2.3.final')
@GrabExclude(group='org.vert-x', module='vertx-platform')
@GrabExclude(group='com.hazelcast', module='hazelcast')
import org.vertx.groovy.core.Vertx
import org.vertx.groovy.core.http.*

@Grab(group='org.apache.poi', module='poi', version='3.8')
import org.apache.poi.hssf.usermodel.HSSFWorkbook
import org.apache.poi.poifs.filesystem.POIFSFileSystem

import groovy.json.JsonOutput

Vertx.newVertx().createHttpServer().requestHandler { HttpServerRequest req ->
    def data = load(Vertx.class.classLoader.getResourceAsStream(
            'com/perceptualedge/Perceptual_Edge_2012_Dashboard_Design_Competition_Data.xls'
    ))

    switch (req.path) {
        case ~'/?(index.html)?':
            println "Serving index"
            req.response.sendFile "src/webroot/index.html"
            break
        case ~'/?data-dashboard.json':
            println "Serving calculated: $req.uri"
            req.response.end(JsonOutput.prettyPrint(JsonOutput.toJson(prepareDashboard(data))))
            break
        case ~'/?data.json':
            println "Serving calculated: $req.uri"
            req.response.end(JsonOutput.prettyPrint(JsonOutput.toJson(data)))
            break
        default:
            println "Serving file: $req.uri"
            req.response.sendFile "src/webroot/$req.path"
    }
}.listen(8080)

System.in.read()

static Map<String, ?> prepareDashboard(Map<String, ?> data) {
    def studentsList = [
            data.students.collect { student ->
                [
                        name: student.name,
                        englishLanguageProficiencyLacking: student.special.englishLanguageProficiency != 'Y',
                        specialEdStatus: student.special.specialEdStatus == 'Y',
                        lateAssignments: student.assignments.completedLateCount as int,
                ]
            },
            data.students.collect { student ->  [scoreByGrade: student.standardizedMathAssessmentScoreByGrade]},
            data.students.collect { student ->  student.grades},
            data.students.collect { student ->  [scores: student.assignments.scoresForThisTerm, lateCount: student.assignments.completedLateCount] },
            data.students.collect { student ->  [detentions: student.detentions, referrals: student.disciplinaryReferrals]},
            data.students.collect { student ->  [tardies: student.tardies, absences: student.absences]},
    ]

    def convertPeerGroup = { peerGroup ->
        peerGroup.findAll { Map.Entry e -> e.key.endsWith('%') }.inject([]) {
            acc, e-> acc << [score: e.key, populationPct: e.value as double]
    }}

    def aggregated = [
            thisClass: [
                    median: data.aggregated.thisClass['My Other 10th Grade Classes Latest Standardized Math Assessment Median Score'] as double,
                    distribution: convertPeerGroup(data.aggregated.thisClass)
            ],
            otherClasses:  [
                    median: data.aggregated.otherClasses['Latest Standardized Math Assessment Median Score'] as double ,
                    distribution: convertPeerGroup(data.aggregated.otherClasses)
            ],
            district:  [
                    median: data.aggregated.district['Latest Standardized Math Assessment Median Score'] as double,
                    distribution: convertPeerGroup(data.aggregated.district)
            ]
    ]

    def yesterday = [
            absences: (data.aggregated.thisClass['Absences Yesterday Count'] as double) as int,
            tardies: (data.aggregated.thisClass['Tardies Yesterday Count'] as double) as int
    ]

    return [aggregated: aggregated, yesterday: yesterday, students: studentsList.transpose() ]
}


/**
 * Parses the Excel spreadsheet from http://www.perceptualedge.com/blog/?p=1308
 * @param spreadsheetInputStream the Excel spreadsheet from http://www.perceptualedge.com/blog/?p=1308
 * @return normalized JSON data
 */
static Map<String, ?> load(InputStream spreadsheetInputStream) {
    assert spreadsheetInputStream

    def wb = new HSSFWorkbook(new POIFSFileSystem(spreadsheetInputStream))

    def table = [description: '']
    for (row in wb.getSheet('Description')) {
        for (cell in row) {
            if (table.description) table.description += '\n'
            table.description += cell
        }
    }

    def absences = parseDatesByNameList(wb, 'Student Absences')
    def tardies = parseDatesByNameList(wb, 'Student Tardies')

    table.students = []
    for (row in wb.getSheet('Student Data')) {
        if (row.rowNum == 0 || !row.getCell(1)) {
//                (1..22).each { println it + " -> " + row?.getCell(it)?.stringCellValue }
            continue
        }

        def studentName = row.getCell(0).stringCellValue
        def data = [
                name: studentName,
                absences: [
                        count: row.getCell(1).numericCellValue,
                        dates: absences[studentName]
                ],
                tardies: [
                        count: row.getCell(2).numericCellValue,
                        dates: tardies[studentName]
                ],
                disciplinaryReferrals: [
                        thisTermCount: row.getCell(3).numericCellValue,
                        lastTermCount: row.getCell(4).numericCellValue
                ],
                detentions: [
                        thisTermCount: row.getCell(5).numericCellValue,
                        lastTermCount: row.getCell(6).numericCellValue
                ],
                standardizedMathAssessmentScoreByGrade: [
                        latest: row.getCell(7).numericCellValue,
                        '9th': row.getCell(8).numericCellValue,
                        '8th': row.getCell(9).numericCellValue,
                        '7th': row.getCell(10).numericCellValue,
                        '6th': row.getCell(11).numericCellValue,
                ],
                assignments: [
                        scoresForThisTerm: [
                                row.getCell(12).numericCellValue,
                                row.getCell(13).numericCellValue,
                                row.getCell(14).numericCellValue,
                                row.getCell(15).numericCellValue,
                                row.getCell(16).numericCellValue,
                        ],
                        completedLateCount: row.getCell(17).numericCellValue,
                ],
                grades: [
                        currentCourse: row.getCell(18).stringCellValue,
                        studentGoal: row.getCell(19).stringCellValue,
                        previousCourse: row.getCell(20).stringCellValue,
                ],
                special: [
                        englishLanguageProficiency: row.getCell(21).stringCellValue,
                        specialEdStatus: row.getCell(22).stringCellValue,
                ]
        ]
        assert data.absences.dates.size() == data.absences.count
        assert data.tardies.dates.size() == data.tardies.count
        table['students'] << data
    }
    assert table.students.name.containsAll(tardies.keySet())
    assert table.students.name.containsAll(absences.keySet())

    table.aggregated = [:]
    [thisClass: 'Class Data', otherClasses: 'School Data', district: 'District Data'].each { name, sheetName ->
        def aggregation = [:]
        wb.getSheet(sheetName).with {
            for (cell in getRow(1)) {
                if (!cell.toString()) continue
                aggregation[cell.stringCellValue.replaceAll('\\s+', ' ')] = getRow(2).getCell(cell.columnIndex).toString()
            }
        }
        table['aggregated'][name] = aggregation
    }
    def gradeGap = {
        ((char)it.grades.studentGoal) - ((char)it.grades.currentCourse)
    }
    table.students.asType(List).sort(true) { s1, s2 ->
        gradeGap(s1) <=> gradeGap(s2)
    }
    return table
}

private static Map<String, List<String>> parseDatesByNameList(HSSFWorkbook wb, String sheetName) {
    def table = [:].withDefault { [] }
    for (row in wb.getSheet(sheetName)) {
        if (row.rowNum==0) continue // headers
        def name = row.getCell(0)?.stringCellValue
        def date = row.getCell(1)?.dateCellValue?.format('yyyy/MM/dd')
        if (name == 'Jame Goss') name = 'Jaime Goss' // fixing a typo in the original Excel spreadsheet
        assert !row.getCell(2)
        if (name && date) {
            table[name] << date
        }
    }
    return table
}
