function buildStructure(json) {
    'use strict';

    var rowHeight = 16;
    var pct = d3.format('%');

    function icon(sel, iconClass, title) {
        return sel.append('i').attr('class', iconClass + ' icon-small').attr('title', title);
    }

    function sparkline(svg, scores) {
        var i, cx, cy;

        svg.append('svg:rect').attr('height', '1').attr('width', '100%').attr('y', '25%').attr('class', 'pct25');
        svg.append('svg:rect').attr('height', '1').attr('width', '100%').attr('y', '50%').attr('class', 'pct50');
        svg.append('svg:rect').attr('height', '1').attr('width', '100%').attr('y', '75%').attr('class', 'pct25');

        for (i = 0; i < scores.length; i++) {
            cx = i * 6 + 3;
            cy = svg.attr('height') - d3.round(scores[i] * (svg.attr('height') - 3) + 1.5);
            svg.append('svg:circle')
                .attr('cx', cx)
                .attr('cy', cy)
                .attr('r', 1.5)
                .attr('class', i === 0 ? 'current' : 'past');
        }
    }

    function bullet(svg, domain, actual, goal, mark) {
        var scaleX;

        scaleX = d3.scale.ordinal().domain(domain).rangePoints([0, svg.attr('width')]);
        svg.append('svg:rect')
            .attr('class', 'range')
            .attr('width', '100%')
            .attr('height', '100%');
        svg.append('svg:rect').attr('class', 'target')
            .attr('width', scaleX(goal))
            .attr('height', '100%');
        svg.append('svg:rect').attr('class', 'actual')
            .attr('width', scaleX(actual))
            .attr('height', '34%')
            .attr('y', '33%');
        svg.append('svg:rect').attr('class', 'mark')
            .attr('x', scaleX(mark) - 2)
            .attr('width', 2)
            .attr('height', '100%');
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
        svg = sel.append('svg')
            .attr('title', 'Current: ' + grades.currentCourse + ', Goal: ' + grades.studentGoal + ', Last year: ' + grades.previousCourse)
            .attr('class', 'bullet')
            .attr('width', 110)
            .attr('height', rowHeight);

        bullet(svg, ['?', 'F', 'E', 'D', 'C', 'B', 'A'], grades.currentCourse, grades.studentGoal, grades.previousCourse);
    }

    function renderAssignments(node, assignments) {
        var scoresPct, lateMsg, sel, svg;

        scoresPct = assignments.scores.map(function (it) { return pct(it) });
        lateMsg = assignments.lateCount > 0 ? ' (' + assignments.lateCount + ' returned late)' : '';

        sel = d3.select(node).attr('class', 'assignments');
        sel.text(pct(assignments.scores[0]) + ' ')
           .attr('title', 'Assignment Scores: ' + scoresPct.join(', ') + lateMsg);

        svg = sel.append('svg')
            .attr('class', 'sparkline')
            .attr('width', assignments.scores.length * 6)
            .attr('height', rowHeight);

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

        svg = sel.append('svg')
            .attr('class', 'sparkline')
            .attr('width', d3.values(data.scoreByGrade).length * 6)
            .attr('height', rowHeight);

        sparkline(svg, d3.values(data.scoreByGrade));
    }

    function renderAttendance(node, data) {
        var sel, svg;

        sel = d3.select(node).attr('class', 'attendance');
        svg = sel.append('svg')
            .attr('class', 'barchart')
            .attr('width', 160)
            .attr('height', rowHeight);

        svg.append('svg:rect').attr('class', 'absences').attr('title', 'Absences: ' + data.absences.dates.join(', '))
            .attr('height', '100%')
            .attr('width', data.absences.count * 10)
            .attr('x', 80 - data.absences.count * 10);

        svg.append('svg:rect').attr('class', 'tardies').attr('title', 'Tardies: ' + data.tardies.dates.join(', '))
            .attr('height', '100%')
            .attr('width', data.tardies.count * 10)
            .attr('x', 80);

        if (data.absences.count) svg.append('svg:text').attr('class', 'label')
            .text(data.absences.count)
            .attr('x', 71)
            .attr('y', 12);

        if (data.tardies.count) svg.append('svg:text').attr('class', 'label')
            .text(data.tardies.count)
            .attr('x', 81)
            .attr('y', 12);
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

        svg = sel.append('svg')
            .attr('class', 'barchart')
            .attr('width', 120)
            .attr('height', rowHeight);

        svg.append('svg:rect').attr('class', 'detentions')
            .attr('height', 11)
            .attr('width', data.detentions.thisTermCount * 20)
            .attr('x', 60 - data.detentions.thisTermCount * 20)
            .attr('y', 3);

        svg.append('svg:rect').attr('class', 'referrals')
            .attr('height', 11)
            .attr('width', data.referrals.thisTermCount * 20)
            .attr('x', 60)
            .attr('y', 3);

        if (disciplinedThisTerm && data.detentions.lastTermCount) {
            svg.append('svg:rect').attr('class', 'detentions')
                .attr('height', '100%')
                .attr('width', 2)
                .attr('x', 60 - data.detentions.lastTermCount * 20);
        }

        if (disciplinedThisTerm && data.referrals.lastTermCount) {
            svg.append('svg:rect').attr('class', 'detentions')
                .attr('height', '100%')
                .attr('width', 2)
                .attr('x', 60 + data.referrals.lastTermCount * 20);
        }

        if (data.detentions.thisTermCount) svg.append('svg:text').attr('class', 'label')
            .text(data.detentions.thisTermCount)
            .attr('x', 51)
            .attr('y', 12);

        if (data.referrals.thisTermCount) svg.append('svg:text').attr('class', 'label')
            .text(data.referrals.thisTermCount)
            .attr('x', 61)
            .attr('y', 12);
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

        svg = stats.append('svg')
            .attr('class', 'stats')
            .attr('width', 800)
            .attr('height', 22);


        labels = aggregated.distribution.map(function (population) {
            return population.score
        });
        color = d3.scale.ordinal().domain(labels).range(colorbrewer.RdYlGn[6]);

        offset = 0;
        aggregated.distribution.forEach(function (population, i) {
                var width, label;

                label = population.score;
                width = population.populationPct * 100;
                svg.append('svg:rect')
                    .attr('x', offset + '%').attr('y', '5%')
                    .attr('width', width + '%').attr('height', '90%')
                    .style('fill', color(label));
                svg.append('svg:text').attr('class', 'label')
                    .text(label)
                    .attr('x', (offset + width / 2 - 3.5) + '%')
                    .attr('y', 16)
                    .style('fill', i === 0 || i == 5 ? 'white' : 'black');

                offset += width;
            }

        );

        gradient = svg.append("svg:defs").append("svg:linearGradient")
            .attr("id", "gradient")
            .attr("x1", "0%")
            .attr("y1", "0%")
            .attr("x2", "100%")
            .attr("y2", "0%")
            .attr("spreadMethod", "pad");

        gradient.append("svg:stop").attr("offset", "0%").attr("stop-color", "blue").attr("stop-opacity", 1);
        gradient.append("svg:stop").attr("offset", "30%").attr("stop-color", "cyan").attr("stop-opacity", 1);
        gradient.append("svg:stop").attr("offset", "100%").attr("stop-color", "blue").attr("stop-opacity", 1);

        svg.append('svg:rect').attr('x', pct(aggregated.median))
            .attr('width', '5px').attr('height', '100%')
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

