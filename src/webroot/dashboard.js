function buildStructure(json) {
    'use strict';

    var rowHeight = 16;
    var pct = d3.format('%');

    function icon(sel, iconClass, title) {
        return sel.append('i').attr('class', iconClass + ' icon-small').attr('title', title);
    }

    function sparkline(svg, scores) {
        var i, cx, cy;

        svg.append('svg:rect').attr({ height: '1', width: '100%', y: '25%', 'class': 'pct25', 'shape-rendering': 'crisp-edges' });
        svg.append('svg:rect').attr({ height: '1', width: '100%', y: '50%', 'class': 'pct50', 'shape-rendering': 'crisp-edges' });
        svg.append('svg:rect').attr({ height: '1', width: '100%', y: '75%', 'class': 'pct25', 'shape-rendering': 'crisp-edges' });

        for (i = 0; i < scores.length; i++) {
            cx = i * 6 + 3;
            cy = svg.attr('height') - d3.round(scores[i] * (svg.attr('height') - 3) + 1.5);
            svg.append('svg:circle').attr({
                    cx: cx + 0.5, cy: cy + 0.5, r: 1.5,
                    'class': i === 0 ? 'current' : 'past',
                    'shape-rendering': 'crisp-edges'
            });
        }
    }

    function bullet(svg, domain, actual, mark, goal) {
        var scaleX;

        scaleX = d3.scale.ordinal().domain(domain).rangePoints([0, svg.attr('width')]);
        svg.append('svg:rect').attr({
            width: '100%', height: '100%',
            'class': 'range', 'shape-rendering': 'crisp-edges'
        });
        svg.append('svg:rect').attr({
            width: d3.round(scaleX(goal)), height: '100%',
            'class': 'last', 'shape-rendering': 'crisp-edges'
        });
        svg.append('svg:rect').attr({
            width: d3.round(scaleX(actual)), height: '6', y: '5',
            'class': 'actual', 'shape-rendering': 'crisp-edges'
        });
        svg.append('svg:rect').attr({
            'x': d3.round(scaleX(mark)) - 4, width: 4, height: '100%',
            'class': 'mark', 'shape-rendering': 'crisp-edges'
        });
    }

    function renderStudent(node, student) {
        var sel, severityColor;

        sel = d3.select(node).text(student.name).attr('class', 'studentName');
        if (student.englishLanguageProficiencyLacking) {
            icon(sel, 'icon-globe', 'English language not proficient');
        }
        if (student.specialEdStatus) {
            icon(sel, 'icon-bullhorn', 'Special education status');
        }
        if (student.lateAssignments) {
            switch (student.lateAssignments) {
                case 1: severityColor = 'lightgray'; break;
                case 2: severityColor = 'gray'; break;
                default : severityColor = 'red'; break;
            }
            icon(sel, 'icon-bell', student.lateAssignments + ' late assignments').style('color', severityColor);
        }
    }

    function renderGrade(node, grades) {
        var sel, svg;

        sel = d3.select(node).attr('class', 'grades');
        svg = sel.append('svg').attr({
            title: 'Current: ' + grades.currentCourse + ', Goal: ' + grades.studentGoal + ', Last year: ' + grades.previousCourse,
            width: 110, height: rowHeight,
            'class': 'bullet'
        });

        bullet(svg, ['?', 'F', 'E', 'D', 'C', 'B', 'A'], grades.currentCourse, grades.studentGoal, grades.previousCourse);
    }

    function renderAssignments(node, assignments) {
        var scoresPct, lateMsg, sel, svg;

        scoresPct = assignments.scores.map(function (it) { return pct(it) });
        lateMsg = assignments.lateCount > 0 ? ' (' + assignments.lateCount + ' returned late)' : '';

        sel = d3.select(node).attr('class', 'assignments');
        sel.text(pct(assignments.scores[0]) + ' ')
            .attr('title', 'Assignment Scores: ' + scoresPct.join(', ') + lateMsg);

        svg = sel.append('svg').attr({
            width: assignments.scores.length * 6, height: rowHeight,
            'class': 'sparkline'
        });
        sparkline(svg, assignments.scores);

        if (assignments.lateCount > 0) {
            sel.append('span').text(' (' + assignments.lateCount + ')')
                .attr('class', 'interjection');
        }
    }

    function renderStandardizedTests(node, data) {
        var scoresPct, sel, svg;

        scoresPct = d3.entries(data.scoreByGrade)
            .filter(function(it) { return it!=='latest grade';})
            .map(function(it) { return it.key + ' grade: ' + pct(it.value); })
            .join(', ');

        sel = d3.select(node).attr('class', 'standardizedTests');
        sel.text(pct(data.scoreByGrade.latest) + ' ')
           .attr('title', 'Previous years scores: ' + scoresPct);

        svg = sel.append('svg').attr({
            width: d3.values(data.scoreByGrade).length * 6, height: rowHeight,
            'class': 'sparkline'
        });

        sparkline(svg, d3.values(data.scoreByGrade));
    }

    function renderAttendance(node, data) {
        var sel, svg;

        sel = d3.select(node).attr('class', 'attendance');
        svg = sel.append('svg')
            .attr({ 'class': 'barchart', width: 160, height: rowHeight });

        svg.append('svg:rect').attr({
            'class': 'absences',
            title: 'Absences: ' + data.absences.dates.join(', '),
            height: '100%', width: data.absences.count * 10, x: 80 - data.absences.count * 10
        });

        svg.append('svg:rect').attr({
            'class': 'tardies',
            title: 'Tardies: ' + data.tardies.dates.join(', '),
            height: '100%', width: data.tardies.count * 10, x: 80
        });

        if (data.absences.count) svg.append('svg:text').attr('class', 'label')
            .text(data.absences.count)
            .attr({ x: 71, y: 12 });

        if (data.tardies.count) svg.append('svg:text').attr('class', 'label')
            .text(data.tardies.count)
            .attr({ x: 81, y: 12 });
    }

    function renderDisciplinary(node, data) {
        var sel, svg, thisYear, lastYear, disciplinedThisTerm, lastYearFragment;

        sel = d3.select(node).attr('class', 'disciplinary');

        thisYear = '';
        if (data.detentions.thisTermCount) {
            thisYear += data.detentions.thisTermCount + ' detentions';
        }
        if (data.referrals.thisTermCount) {
            if (thisYear.length) thisYear += ' and ';
            thisYear += data.referrals.thisTermCount + ' referrals';
        }

        lastYear = '';
        if (data.detentions.lastTermCount) {
            lastYear += data.detentions.lastTermCount + ' detentions';
        }
        if (data.referrals.lastTermCount) {
            if (lastYear.length) lastYear += ' and ';
            lastYear += data.referrals.lastTermCount + ' referrals';
        }

        if (thisYear) {
            lastYearFragment = lastYear.length ? ' (last year ' + lastYear + ')' : '';
            sel.attr('title', thisYear + lastYearFragment);
        }


        disciplinedThisTerm = data.detentions.thisTermCount || data.referrals.thisTermCount;

        svg = sel.append('svg').attr({
            'class': 'barchart',
            width: 120, height: rowHeight
        });

        svg.append('svg:rect').attr({
            'class': 'detentions',
            height: 11, width: data.detentions.thisTermCount * 20, x: 60 - data.detentions.thisTermCount * 20, y: 3
        });

        svg.append('svg:rect').attr({
            'class': 'referrals',
            height: 11, width: data.referrals.thisTermCount * 20, x: 60, y: 3
        });

        if (disciplinedThisTerm && data.detentions.lastTermCount) {
            svg.append('svg:rect').attr({
                'class': 'detentions',
                height: '100%', width: 2, x: 60 - data.detentions.lastTermCount * 20
            });
        }

        if (disciplinedThisTerm && data.referrals.lastTermCount) {
            svg.append('svg:rect').attr({
                'class': 'detentions',
                height: '100%', width: 2, x: 60 + data.referrals.lastTermCount * 20
            });
        }

        if (data.detentions.thisTermCount) svg.append('svg:text').attr('class', 'label')
            .text(data.detentions.thisTermCount)
            .attr({ x: 51, y: 12 });

        if (data.referrals.thisTermCount) svg.append('svg:text').attr('class', 'label')
            .text(data.referrals.thisTermCount)
            .attr({ x: 61, y: 12 });
    }

    function renderDispatch(data, i) {
        var renderers = [
            renderStudent,
            renderStandardizedTests,
            renderGrade,
            renderAssignments,
            renderDisciplinary,
            renderAttendance
        ];
        renderers[i](this, data);
    }

    function appendStateDistribution(title, aggregated) {
        var stats, svg, offset, labels, color, gradient;

        stats = d3.select('#stats').append('div');
        stats.append('div').text(title)
             .style('float', 'left')
             .style('width', '100px')
             .style('text-align', 'right')
             .style('padding-right', '.3em');

        svg = stats.append('svg').attr({'class': 'stats', width: 800, height: 22});


        labels = aggregated.distribution.map(function (population) {
            return population.score
        });
        color = d3.scale.ordinal().domain(labels).range(colorbrewer.RdYlBu[6].map(function(rgbStr) {
            var hsl = d3.rgb(rgbStr).hsl();
            hsl.s = 0.2;
            return hsl;
        }));

        offset = 0;
        aggregated.distribution.forEach(function (population, i) {
                var width, label;

                label = population.score;
                width = population.populationPct * 100;
                svg.append('svg:rect').attr({ x: offset + '%', y: '5%', width: width + '%', height: '90%'})
                    .style('fill', color(label));

                svg.append('svg:text').attr('class', 'label')
                    .text(label)
                    .attr({x: (offset + width / 2 - 3.5) + '%', y: 16 })
                    .style('fill', i === 0 || i == 5 ? 'white' : 'black');

                offset += width;
            }

        );

        gradient = svg.append("svg:defs").append("svg:linearGradient").attr({
            id: "gradient",
            spreadMethod: "pad",
            x1: "0%", y1: "0%",
            x2: "100%", y2: "0%"
        });

        gradient.append("svg:stop").attr({ offset:   "0%", "stop-color": "blue", "stop-opacity": 1 });
        gradient.append("svg:stop").attr({ offset:  "30%", "stop-color": "cyan", "stop-opacity": 1 });
        gradient.append("svg:stop").attr({ offset: "100%", "stop-color": "blue", "stop-opacity": 1 });

        svg.append('svg:rect').attr({ x: pct(aggregated.median), width: '5px', height: '100%' })
            .style('fill', 'url(#gradient)');

    }

    d3.select('#students tbody')
        .selectAll('tr').data(json.students).enter().append("tr")
        .selectAll('td').data(function(d) { return d; }).enter().append('td')
        .each(renderDispatch);

    appendStateDistribution('My classes', json.aggregated.thisClass);
    appendStateDistribution('This school', json.aggregated.otherClasses);
    appendStateDistribution('District', json.aggregated.district);
}

