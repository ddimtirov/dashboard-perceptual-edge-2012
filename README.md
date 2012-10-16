Overview
========

This is my submission for the 2012 Dashboard Competition organized by Perceptual Edge. You can view the [rules](http://www.perceptualedge.com/blog/?p=1308 "Perceptual Edge’s 2012 Dashboard Design Competition"), and [the winners](http://www.perceptualedge.com/blog/?p=1374 "2012 Perceptual Edge Dashboard Design Competition: We Have a Winner!") at the _Visual Business Intelligence_ blog.

Check out the **[live dashboard](http://bl.ocks.org/d/3896632/ "latest stable version of the dashboard")** - I will try to update it every time I change something of significance. As my primary motivation for participating was to learn, I am planning to keep implementing the mocked up features described in the original submission (see [/src/mockups](https://github.com/ddimtirov/dashboard-perceptual-edge-2012/tree/master/src) ). I decided not to change the concept, even though I am tempted to borrow some of the good ideas of the winning entry ;-)


Competition Entry Submission
============================

  This document aims to describe the design and rationale behind the
	dashboard and can not serve as user manual. The current dashboard
	design should be treated as finished prototype, ready to be shown to
	client, but pending tweeks based on initial feedback and not yet
	ready for a wide rollout.

	The dashboard consists of the following elements (see '1-dashboard.png'):


	1. Students table

		The table at the top part of the dashboard has a row for each 
		student


	1.1. Sorting

		The table is sorted by decreasing difference between desired and current
		grade, illustrated by bullet graph in the 'Objective' column. This means
		that the students that are furthest away from their target grade would
		always be at the top of the list. This criteria can be tweaked based on
		teacher's input to take into account the assignment scores, remaining
		assignments, assignment weight, etc.

		The sorting can not be changed, which limits the exploration capabilities
		of the dashboard, but allows the teachers to internalize spatial patterns
		and percieve anomalies. I.e. "long-bar in the attendance column near to
		the top of the table" - a sign that a performance, likely caused by
		skipping classes.


	1.2. Student name and Badges column

		The name of the student is in the first column, serving as implicit label
		for the rest of the data in the row. After each name there may be some
		icons (we call them 'badges'), indicating specific circumstances about the
		said student. The expectation is that by using the dashboard every day, a
		teacher would quickly learn what each badge means. Hovering over the badge
		pops a tooltip with explanation and details.

		Here is a list of the badges employed in the current screenshot:

		| ICON        | TOOLTIP                         
		------------------------------------------------
		| bull-horn   | Special education status        
		| globe       | English language not proficient 
		| bell        | <number> late assignments              

		The color of a badge may be used as secondary indicator (i.e. for
		severity). For the 'bell' icon, the color depends on how many assignments
		have been late - red for >50%, gray for >20%, light gray for >0

		Badges are supposed to be unobtrusive 'by the way' indicators that would
		draw the teacher's attention to the relevant details. They are placed
		immediately after the student name, and do not have a dedicated column, as
		we expect teachers will rarely search for a badge, but will only use it to
		provide context to a name.


	1.3. Standardized Math Assessment Test column

		The heading of Standardized Math Assignment column is abreviated to 'SMA',
		as a teacher is likely to know what that means (if there is another acronym
		in common use by American teachers we should use that). Hovering over the
		column label pops a tooltip with full description 'Standardized Math
		Assignment over the years'

		Each row conists of the latest score and a sparkline dot plot, of the SMA
		results over the last 5 years. The dot corresponding to the depicted number
		is closest to the number and is different color. 3 gray lines form placed
		at 25%, 50% and 75% form a 'staff' (similar to musical notation) , allowing
		the teacher to judge in qhich quartile a dot is.

		Hovering over the cell (text or graph) displays a tooltip with the values
		for the past years (the current year's score is already on the screen):

		  'Past years scores: 9th grade 50%, 8th grade 45%, 7th grade 56%, 6th
		  grade 56%'

	  
	1.4. Objectve column

		The objective column summarizes the current grade, the student's desired
		grade and last year's grade in a bullet chart. The bar of the bulet indicates
		the current grade, the track indicates the target and the notch indicates
		last year's grade.

		All data is easy to asses visually, except the difference between current and
		desired grade, which may be an important indicator (that is the reason we are
		using it for sorting the table).

		Hovering over the graph displays a tooltip with the actual values:

		   'Current: C, Goal: C, Last year: F'


	1.5. Assignments column

		The visualization is the same as the one used in the SMA column, with the
		addition of an indicator for late assignments (blue number in parens after
		the sparkline). The late indicator is colored blue (same as other non-score
		data), while the test scores are black.

		Hovering over the graph displays a tooltip with the actual values:

		   'Assignment scores: 66%, 71%, 73%, 70%, 79%'

		or

		   'Assignment scores: 66%, 71%, 73%, 70%, 79% (1 returned late)'


	1.6. Disciplinary column

		Stacked horizontal bar chart, with fixed center, allowing comparison between
		both the number of detentions and referals (detentions are darker, extending
		to the left; referrals are lighter, on the right). The total length of both
		bars shows the sum of all disciplinary incidents. The previous year
		detentions/referals are displayed as ticks, facilitating comparison.


		Hovering over the graph displays a tooltip with the human readable
		description:

		   '1 detention and 2 referrals'  (if no referrals last year)

		or

		   '1 referral (last year 1 detention and 1 referral)'  (if disciplined last
		   year)

		If not disciplined this year, last year's offences are not displayed to
		reduce the clutter.


	1.7. Attendance column

		Same structure as the disciplinary chart, but without the last year markers.
		The total length of the bar tells us the total number of days when a student
		has not been on time. The left-side outline gives us the no-show stats, the
		right side the tardy stats.

		The tooltip text when you hover over a bar is:

		   'Absences: Jul 13, Jul 17, Sept 9'

		or

		   'Tardy: Jun 12, Jul: 31'


	2. Peer group statistics

		Below the students chart is the peer group statistics, showing
		distribution of grades among student populations of all classes
		of the current teacher, the whole school and the whole district.
		The median in each population is marked with blue tick.

		This chart is of limited usefulness by itself, but provides
		context when interacting with the dashboard.

		As the traffic-light color scheme is a bit distracting, I also
		experimented with monochrome version and it works better in some
		situations (see all PNG's suffixed with '-alt-). Further
		usability testing of interaction scenarios is required to decide
		in which situations color / monochrome works better and devise a
		strategy for switching between them without creating unwanted
		transitions.


	3. Last class presence

		At the bottom of the dashboard is the last class presence
		information, this is a quick reminder for the teacher before
		they start the class.


	4. Interaction

		Mousing over a row would highlight the row and place markers of
		where that student would be in all three peer groups
		(see '2-dashboard-row.png').

		Mousing over a quantitive column would color code the values in
		the column in three 33-percentile groups.

		For example, in '3-dashboard-column.png', the teacher has
		hovered over the 'Assignments' heading and the students are
		highlighted as bottom, middle and top third.

		It would work the same way for the SMA column, 'Objectives'
		would color based on target score, 'Disciplinary' and
		'Attendance' would color based on total number of offences.

		Mousing over the peer-group graph, would show a marker and would
		color the SMA values above and below the threshold.
		(see '4-dashboard-threshold.png')


	5. Responsive design

		The refinements below would allow the dashboard to be displayed
		on a smartphone, tablet and PC with the best possible dataset
		and minimum scrolling.

		If the view is too short and does not fit the whole student
		table, together with the peer group stats, the peer stats
		section stays docked (fixed) at the bottom of the window, while
		vertical scrolling scrolls the student list. When the end
		student list is fully displayed, on further scroll down, we
		display the 'last class presence' section.

		If the view is too narrow, we try to shrink the width
		Disciplinary, Attendance and Objective graphs. 
		
		If the view width is below a certain threshold, we would replace 
		the Disciplinary/Attendance graphs, with two simple numbers 
		(ignoring historical data).
		
		If the view width is below a second threshold, we would replace 
		the bullet chart with simplified textual description of current 
		and desired grades (i.e. 'A->C', meaning that student has A, but
		they set their goal to C).


	6. Further options to consider

		- Rich tooltips - instead of textual summary, the tooltips may
		  in contain tables and simple graphs to allow faster reading.

		- The sorting criteria should be further tweaked to reflect 
		  teacher's expectations. 

		- Reassess the usefulness of the current badges. Once 
		  familiarized with the concept, talk with teachers about what
		  notable indicators they may find useful for performance
		  evaluation.

		- If the application supports user profiles, teachers should 
		  be able to:

		      - change the quoefficients of the formula calculating the 
			'index' used for sorting.  

		      - choose which badges they want or don't want to see

		      - customize thresholds for color-coded badges


		- As I could not find information whether referals cause 
		  detentions, or they are unrelated incidents, I assumed the
		  latter.

		  If it was the former, I would use a 'bottle graph' - a stacked
		  chart with detentions at the base (left) and  non-detention-
		  referals stacked on top of it with a narrower bar (same
		  color).

		  The last year referals would be indicated by a dot on the
		  central axis.  Overall looking like this (text not part of
		  the graph):

				           |
			+--------------+-----------+
			| This year: 2 det, 4 ref  +-----------------+
			| Last year: 1 det, 1 ref            O       |
			|                          +-----------------+
			+--------------+-----------+ 
				           |   

						               |   
			+--------------+           |
			| TY: 1D, 3R   +-----------+---------+
			| LY, 2D, 2R               O         |  
			|              +-----------+---------+
			+--------------+           |
						               |   

						                         |   
			+--------------+                     |
			| TY: 1D, 1R   |                     |
			| LY: 3D, 4R   |                     |     O  
			|              |                     |
			+--------------+                     |
							                     |   
