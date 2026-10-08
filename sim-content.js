/* Job Simulator content: every number comes from this project's own answer keys and gotchas. */
window.SIM_CONTENT = {
 "site": "ShodweStay Hospitality Analytics",
 "intro": {
  "incident": "Real alerts from Shodwe Group revenue, guest-experience and finance leaders, each built on a trap this project teaches. Check the evidence, pick the root cause and the fix, then write the reply you would send.",
  "broken": "A junior analyst built this Booking & Occupancy Overview from fact_bookings and the mart view. Find every tile that uses a wrong formula, table or denominator before it reaches leadership.",
  "stakeholder": "Shodwe stakeholders rarely ask precise questions. Pick the clarifying questions that turn a vague request into a clear KPI spec, and skip the ones that waste their time."
 },
 "incidents": [
  {
   "id": "i1",
   "lvl": "Easy",
   "title": "“Guests rate us only 1.52 out of 5!”",
   "from": "Meera Krishnan · Head of Guest Experience",
   "time": "Mon 9:20 AM",
   "msg": "The guest report says our average rating is 1.52 out of 5. That's a disaster. Should I call an emergency meeting with all 25 hotel GMs?",
   "metric": [
    [
     "Average rating on the report",
     "1.52 / 5"
    ]
   ],
   "evidence": [
    {
     "id": "e1",
     "rel": true,
     "t": "AVG vs blanks counted as 0",
     "sql": "SELECT ROUND(AVG(ratings_given), 2)                          AS avg_rated,\n       ROUND(SUM(COALESCE(ratings_given, 0)) / COUNT(*), 2)    AS avg_blanks_as_0\nFROM fact_bookings;",
     "res": [
      [
       "avg_rated",
       "3.62"
      ],
      [
       "avg_blanks_as_0",
       "≈ 1.52"
      ],
      [
       "rated bookings",
       "56,683"
      ],
      [
       "all bookings",
       "134,590"
      ]
     ],
     "note": "AVG skips blanks and gives 3.62. The report filled blanks with 0 and divided by all 134,590 bookings, which gives about 1.52."
    },
    {
     "id": "e2",
     "rel": true,
     "t": "Who can leave a rating?",
     "sql": "SELECT booking_status, COUNT(*) AS bookings, COUNT(ratings_given) AS rated\nFROM fact_bookings GROUP BY booking_status;",
     "res": [
      [
       "Checked Out",
       "94,411"
      ],
      [
       "Cancelled",
       "33,420"
      ],
      [
       "No Show",
       "6,759"
      ],
      [
       "rated (Checked Out only)",
       "56,683"
      ]
     ],
     "note": "40,179 cancelled and no-show bookings never stayed, so they can never have a rating. Treating them as 0 stars is wrong."
    },
    {
     "id": "e3",
     "rel": true,
     "t": "Rating coverage",
     "sql": "SELECT ROUND(100 * COUNT(ratings_given) / COUNT(*), 1) AS coverage_pct,\n       SUM(booking_status = 'Checked Out' AND ratings_given IS NULL) AS unrated_stays\nFROM fact_bookings;",
     "res": [
      [
       "coverage_pct",
       "42.1%"
      ],
      [
       "unrated_stays",
       "37,728"
      ]
     ],
     "note": "Only 42.1% of bookings have a rating. Even 37,728 completed stays (40.0%) left no rating, so coverage must be shown next to the score."
    },
    {
     "id": "e4",
     "rel": false,
     "t": "Revenue by city",
     "sql": "SELECT h.city, SUM(b.revenue_realized) FROM fact_bookings b\nJOIN dim_hotels h ON h.property_id = b.property_id GROUP BY h.city;",
     "res": [
      [
       "Mumbai",
       "39.1%"
      ],
      [
       "Bangalore",
       "24.6%"
      ],
      [
       "Hyderabad",
       "19.0%"
      ],
      [
       "Delhi",
       "17.2%"
      ]
     ],
     "note": "Useful for the city page, but revenue share says nothing about the rating."
    }
   ],
   "causes": [
    [
     "c1",
     "Guests really are very unhappy with every hotel"
    ],
    [
     "c2",
     "Blank ratings were treated as 0 and the average was taken over all bookings, including cancelled and no-show bookings that can never be rated",
     true
    ],
    [
     "c3",
     "The rating scale was changed from 5 to 10"
    ],
    [
     "c4",
     "Some hotels are missing from dim_hotels"
    ],
    [
     "c5",
     "Ratings were entered twice for some guests"
    ]
   ],
   "fixes": [
    [
     "f1",
     "Use AVG(ratings_given) over rated stays only = 3.62, and show coverage next to it (56,683 rated, 42.1% of bookings)",
     true
    ],
    [
     "f2",
     "Fill every blank rating with 3 so the average looks normal"
    ],
    [
     "f3",
     "Delete all bookings that have no rating"
    ],
    [
     "f4",
     "Stop showing the rating on the dashboard"
    ]
   ],
   "answer": "Root cause: blanks were counted as 0 stars, and 40,179 cancelled or no-show bookings that can never be rated were in the denominator. Average over rated stays is <b>3.62 / 5</b>, based on 56,683 ratings (42.1% coverage).",
   "tell": "“No emergency. The 1.52 counted every booking without a rating as zero stars, even guests who never stayed. Guests who rated us give 3.62 out of 5. The real worry is that only 42% of bookings have a rating, so let's push post-checkout feedback.”"
  },
  {
   "id": "i2",
   "lvl": "Easy",
   "title": "“‘Others’ is our best channel”",
   "from": "Vikram Malhotra · Head of Distribution",
   "time": "Tue 11:05 AM",
   "msg": "The channel report says 'others' brings 40.9% of our bookings, twice makeyourtrip. I want to cut OTA commission budgets and put the money into 'others'. Can you confirm?",
   "metric": [
    [
     "'others' share of bookings",
     "40.9%"
    ],
    [
     "makeyourtrip share",
     "20.0%"
    ]
   ],
   "evidence": [
    {
     "id": "e1",
     "rel": true,
     "t": "Bookings by booking_platform",
     "sql": "SELECT booking_platform, COUNT(*) AS bookings,\n       ROUND(100 * COUNT(*) / SUM(COUNT(*)) OVER (), 1) AS share_pct\nFROM fact_bookings GROUP BY booking_platform ORDER BY bookings DESC;",
     "res": [
      [
       "others",
       "55,066 (40.9%)"
      ],
      [
       "makeyourtrip",
       "26,898 (20.0%)"
      ],
      [
       "logtrip",
       "14,756 (11.0%)"
      ],
      [
       "direct online",
       "13,379 (9.9%)"
      ],
      [
       "tripster",
       "9,630 (7.2%)"
      ]
     ],
     "note": "'others' is the single biggest value, but it isn't the name of any channel."
    },
    {
     "id": "e2",
     "rel": true,
     "t": "Named platforms combined",
     "sql": "SELECT SUM(booking_platform IN ('makeyourtrip','logtrip','direct online','tripster')) AS named_four,\n       SUM(booking_platform = 'others') AS others\nFROM fact_bookings;",
     "res": [
      [
       "named_four",
       "64,663"
      ],
      [
       "others",
       "55,066"
      ]
     ],
     "note": "The four named platforms together bring more bookings than 'others'."
    },
    {
     "id": "e3",
     "rel": true,
     "t": "Data-quality note on booking_platform",
     "sql": "-- Data Quality notes → fact_bookings.booking_platform",
     "res": [
      [
       "'others'",
       "unnamed bucket, not a real channel"
      ],
      [
       "action",
       "check the source mapping first"
      ]
     ],
     "note": "'others' can hold several channels, including OTAs. It is a tagging gap to flag, not a channel insight."
    },
    {
     "id": "e4",
     "rel": false,
     "t": "Booking % by room class",
     "sql": "SELECT r.room_class, COUNT(*) FROM fact_bookings b\nJOIN dim_rooms r ON r.room_id = b.room_category GROUP BY r.room_class;",
     "res": [
      [
       "Elite",
       "36.8%"
      ],
      [
       "Standard",
       "28.6%"
      ],
      [
       "Premium",
       "22.7%"
      ],
      [
       "Presidential",
       "11.9%"
      ]
     ],
     "note": "Room mix is interesting, but it doesn't tell us which channel works."
    }
   ],
   "causes": [
    [
     "c1",
     "'others' is a hidden direct channel that guests prefer"
    ],
    [
     "c2",
     "OTAs stopped sending bookings in July"
    ],
    [
     "c3",
     "'others' is an unnamed catch-all value in booking_platform, so it is a data-tagging gap, not a channel that can be funded",
     true
    ],
    [
     "c4",
     "makeyourtrip bookings were counted twice"
    ],
    [
     "c5",
     "The share was calculated without ALL() in the denominator"
    ]
   ],
   "fixes": [
    [
     "f1",
     "Label 'others' as 'Unidentified platform (40.9%)', add a data-quality note, and ask the source owners to map it to real channels before any budget decision",
     true
    ],
    [
     "f2",
     "Move all OTA budget to 'others' as asked"
    ],
    [
     "f3",
     "Delete the 55,066 'others' bookings from the dashboard"
    ],
    [
     "f4",
     "Merge 'others' into direct online"
    ]
   ],
   "answer": "Root cause: 'others' is an unnamed bucket, not a channel. It holds 55,066 bookings (40.9%), but the four named platforms together bring <b>64,663</b>. Fix the tagging first, then decide on budgets.",
   "tell": "“'Others' isn't a channel we can pay or grow. It's bookings with no platform name, and it may include OTAs. Let's get the source team to map it before we move any money. Meanwhile, direct online at 9.9% is the clean lever to grow.”"
  },
  {
   "id": "i3",
   "lvl": "Medium",
   "title": "“Luxury earns more, so renovate Luxury”",
   "from": "Arvind Menon · CFO",
   "time": "Wed 10:40 AM",
   "msg": "The category chart shows Luxury hotels earned $1,052.8M and Business only $656.0M. I plan to put the whole renovation budget into Luxury. Any reason not to sign this today?",
   "metric": [
    [
     "Luxury revenue",
     "$1,052.8M"
    ],
    [
     "Business revenue",
     "$656.0M"
    ]
   ],
   "evidence": [
    {
     "id": "e1",
     "rel": true,
     "t": "Hotels per category",
     "sql": "SELECT category, COUNT(*) AS hotels\nFROM dim_hotels GROUP BY category;",
     "res": [
      [
       "Luxury",
       "16"
      ],
      [
       "Business",
       "9"
      ],
      [
       "Total",
       "25"
      ]
     ],
     "note": "Luxury has 16 hotels and Business only 9, so category totals are not a fair comparison."
    },
    {
     "id": "e2",
     "rel": true,
     "t": "Revenue per hotel by category",
     "sql": "SELECT h.category, COUNT(DISTINCT h.property_id) AS hotels,\n       SUM(b.revenue_realized) AS revenue,\n       ROUND(SUM(b.revenue_realized) / COUNT(DISTINCT h.property_id)) AS revenue_per_hotel\nFROM fact_bookings b JOIN dim_hotels h ON h.property_id = b.property_id\nGROUP BY h.category;",
     "res": [
      [
       "Luxury revenue",
       "$1,052.8M"
      ],
      [
       "Luxury per hotel",
       "$65.8M"
      ],
      [
       "Business revenue",
       "$656.0M"
      ],
      [
       "Business per hotel",
       "$72.9M"
      ]
     ],
     "note": "Per hotel, a Business property earns more than a Luxury one."
    },
    {
     "id": "e3",
     "rel": true,
     "t": "Revenue definition check",
     "sql": "SELECT SUM(revenue_realized) AS revenue FROM fact_bookings;  -- 1,708,771,229",
     "res": [
      [
       "revenue_realized total",
       "$1,708,771,229"
      ],
      [
       "Luxury + Business",
       "$1,052.8M + $656.0M"
      ]
     ],
     "note": "Both category figures use revenue_realized and add up to the group total, so the totals are right. Only the comparison is unfair."
    },
    {
     "id": "e4",
     "rel": false,
     "t": "Booking % by room class",
     "sql": "SELECT r.room_class, COUNT(*) FROM fact_bookings b\nJOIN dim_rooms r ON r.room_id = b.room_category GROUP BY r.room_class;",
     "res": [
      [
       "Elite",
       "36.8%"
      ],
      [
       "Standard",
       "28.6%"
      ],
      [
       "Premium",
       "22.7%"
      ],
      [
       "Presidential",
       "11.9%"
      ]
     ],
     "note": "Room mix is useful for pricing, but it does not compare the two hotel categories."
    }
   ],
   "causes": [
    [
     "c1",
     "Luxury hotels charge higher prices, so they are the better investment"
    ],
    [
     "c2",
     "Business revenue is missing cancelled bookings"
    ],
    [
     "c3",
     "The chart compares category totals, but Luxury has 16 hotels and Business only 9. Per hotel, Business earns more",
     true
    ],
    [
     "c4",
     "Luxury revenue was summed from revenue_generated"
    ],
    [
     "c5",
     "Some Business hotels are mapped to the wrong city"
    ]
   ],
   "fixes": [
    [
     "f1",
     "Add a revenue-per-hotel view by category, with occupancy and RevPAR next to it, before any budget decision",
     true
    ],
    [
     "f2",
     "Approve the Luxury budget as planned"
    ],
    [
     "f3",
     "Remove Business hotels from the chart"
    ],
    [
     "f4",
     "Split the budget equally across both categories"
    ]
   ],
   "answer": "Root cause: the chart compares <b>totals</b> across groups of different size. Luxury has 16 hotels and Business 9. Per hotel, Business earns <b>$72.9M</b> and Luxury <b>$65.8M</b>. The totals are correct, but they cannot rank the categories.",
   "tell": "“Luxury earns more in total only because it has 16 hotels against 9. Per hotel, Business earns $72.9M vs $65.8M for Luxury, so let's compare per-hotel returns before we fix the renovation budget.”"
  },
  {
   "id": "i4",
   "lvl": "Advanced",
   "title": "“We're 70% full, time to add rooms”",
   "from": "Rohan Kapoor · VP Development",
   "time": "Thu 4:15 PM",
   "msg": "The new mart-view dashboard shows Occupancy at 70.2% and RevPAR at $12,696, the same as ADR. That says we sell almost every room at full price. Should I start the expansion proposal for more rooms?",
   "metric": [
    [
     "Occupancy %",
     "70.2%"
    ],
    [
     "RevPAR",
     "$12,696"
    ]
   ],
   "evidence": [
    {
     "id": "e1",
     "rel": true,
     "t": "What the 70.2% really measures",
     "sql": "SELECT ROUND(100 * SUM(booking_status = 'Checked Out') / COUNT(*), 1) AS realisation_pct  -- 70.2\nFROM fact_bookings;",
     "res": [
      [
       "Checked Out",
       "94,411"
      ],
      [
       "All bookings",
       "134,590"
      ],
      [
       "Realisation %",
       "70.2%"
      ]
     ],
     "note": "70.2% is Realisation %: the share of bookings that turned into a stay. It says nothing about empty rooms."
    },
    {
     "id": "e2",
     "rel": true,
     "t": "Occupancy from the capacity table",
     "sql": "SELECT ROUND(100 * SUM(successful_bookings) / SUM(capacity), 1) AS occupancy_pct,  -- 57.9\n       ROUND(SUM(capacity) / 92)            AS dsrn,   -- 2,528\n       ROUND(SUM(successful_bookings) / 92) AS dbrn    -- 1,463\nFROM fact_aggregated_bookings;",
     "res": [
      [
       "Occupancy %",
       "57.9%"
      ],
      [
       "DSRN (sellable / day)",
       "2,528"
      ],
      [
       "DBRN (booked / day)",
       "1,463"
      ],
      [
       "DURN (utilized / day)",
       "1,026"
      ]
     ],
     "note": "Capacity lives only in fact_aggregated_bookings. Real occupancy is 57.9%, and roughly 1,500 sellable room-nights a day end up empty."
    },
    {
     "id": "e3",
     "rel": true,
     "t": "RevPAR denominator check",
     "sql": "SELECT ROUND((SELECT SUM(revenue_realized) FROM fact_bookings)\n           / (SELECT SUM(capacity) FROM fact_aggregated_bookings)) AS revpar;  -- 7,347\n-- the dashboard divided by SUM(successful_bookings) = 134,590 (rooms sold), which is ADR",
     "res": [
      [
       "Revenue",
       "$1,708,771,229"
      ],
      [
       "ADR (÷ 134,590 bookings)",
       "$12,696"
      ],
      [
       "RevPAR (÷ capacity)",
       "$7,347"
      ]
     ],
     "note": "RevPAR must divide by rooms available. Dividing by rooms sold just repeats ADR, and RevPAR can never exceed ADR below 100% occupancy."
    },
    {
     "id": "e4",
     "rel": false,
     "t": "Revenue share by city",
     "sql": "SELECT h.city, SUM(b.revenue_realized) FROM fact_bookings b\nJOIN dim_hotels h ON h.property_id = b.property_id GROUP BY h.city;",
     "res": [
      [
       "Mumbai",
       "39.1%"
      ],
      [
       "Bangalore",
       "24.6%"
      ],
      [
       "Hyderabad",
       "19.0%"
      ],
      [
       "Delhi",
       "17.2%"
      ]
     ],
     "note": "Shows where revenue comes from, not how full the hotels are."
    }
   ],
   "causes": [
    [
     "c1",
     "Demand really is close to capacity in every city"
    ],
    [
     "c2",
     "The 70.2% is Realisation % from fact_bookings, and RevPAR was divided by rooms sold. Both ignore capacity, which lives only in fact_aggregated_bookings",
     true
    ],
    [
     "c3",
     "Cancelled bookings were left out of revenue"
    ],
    [
     "c4",
     "The weekend was defined as Saturday and Sunday"
    ],
    [
     "c5",
     "The 'others' platform double-counts bookings"
    ]
   ],
   "fixes": [
    [
     "f1",
     "Rebuild Occupancy % and RevPAR from fact_aggregated_bookings: SUM(successful_bookings) ÷ SUM(capacity) and revenue ÷ SUM(capacity), summed at their own grain, and relabel 70.2% as Realisation %",
     true
    ],
    [
     "f2",
     "Keep 70.2% and add a note that it is approximate"
    ],
    [
     "f3",
     "SUM(capacity) from the mart view so both KPIs come from one table"
    ],
    [
     "f4",
     "Hide RevPAR because it duplicates ADR"
    ]
   ],
   "answer": "Root cause: the card labelled Occupancy shows <b>Realisation %</b> (94,411 ÷ 134,590 = 70.2%), and RevPAR was divided by rooms sold, so it equals ADR ($12,696). Capacity sits only in fact_aggregated_bookings and repeats on every row of the mart view, so it must be summed in its own table. Correct: <b>Occupancy 57.9%</b> and <b>RevPAR $7,347</b>. About 1,500 sellable room-nights a day stay empty.",
   "tell": "“We're not 70% full. That figure is the share of bookings that turned into stays. Real occupancy is 57.9% and RevPAR is $7,347, with about 1,500 room-nights a day unsold, so the case is for filling rooms, not adding them.”"
  }
 ],
 "broken": {
  "from": "Group Revenue Manager",
  "brief": "“A junior analyst built this for tomorrow's leadership review. Something feels off. Flag every number you would NOT present, then submit.”",
  "title": "ShodweStay · Booking & Occupancy Overview · May–Jul 2022",
  "tiles": [
   {
    "id": "t1",
    "label": "Total Bookings",
    "val": "134,590",
    "bad": false,
    "why": "Correct: COUNT(*) of fact_bookings."
   },
   {
    "id": "t2",
    "label": "Revenue (realized)",
    "val": "$1,708,771,229",
    "bad": false,
    "why": "Correct: SUM(revenue_realized), where cancelled bookings keep only 60% of revenue_generated."
   },
   {
    "id": "t3",
    "label": "Occupancy %",
    "val": "70.2%",
    "bad": true,
    "why": "Checked-out ÷ all bookings from fact_bookings. That is Realisation %, not occupancy. Correct: SUM(successful_bookings) ÷ SUM(capacity) from fact_aggregated_bookings = 57.9%."
   },
   {
    "id": "t4",
    "label": "ADR",
    "val": "$12,696",
    "bad": false,
    "why": "Correct per the KPI register: revenue ÷ total bookings (134,590)."
   },
   {
    "id": "t5",
    "label": "RevPAR",
    "val": "$12,696",
    "bad": true,
    "why": "Revenue ÷ SUM(successful_bookings), i.e. rooms sold, so it just repeats ADR. RevPAR divides by rooms available and must be below ADR when occupancy is under 100%. Correct: revenue ÷ SUM(capacity) = $7,347."
   },
   {
    "id": "t6",
    "label": "Cancellation %",
    "val": "24.8%",
    "bad": false,
    "why": "Correct: 33,420 cancelled ÷ 134,590 bookings."
   },
   {
    "id": "t7",
    "label": "Average Rating",
    "val": "1.52 / 5",
    "bad": true,
    "why": "Blank ratings were treated as 0 and divided by all 134,590 bookings. Cancelled and no-show guests can never rate. Correct: AVG over rated stays = 3.62, shown with 42.1% coverage."
   },
   {
    "id": "t8",
    "label": "Top Booking Channel",
    "val": "others · 40.9%",
    "bad": true,
    "why": "'others' is an unnamed catch-all bucket, not a channel, and the four named platforms together bring more (64,663). Correct: flag 'others' as a data gap; the biggest named channel is makeyourtrip at 20.0%."
   },
   {
    "id": "t9",
    "label": "Best Category (revenue per hotel)",
    "val": "Luxury · $1,052.8M",
    "bad": true,
    "why": "Shows the Luxury category total, which is bigger only because Luxury has 16 hotels vs 9. Correct: per hotel, Business leads with $72.9M vs $65.8M for Luxury."
   },
   {
    "id": "t10",
    "label": "Mumbai Share of Revenue",
    "val": "39.1%",
    "bad": false,
    "why": "Correct: Mumbai revenue_realized ($668.6M) ÷ total revenue_realized."
   }
  ],
  "chart": {
   "title": "Booking % by platform",
   "bars": [
    [
     "others",
     "100%",
     100
    ],
    [
     "makeyourtrip",
     "100%",
     100
    ],
    [
     "logtrip",
     "100%",
     100
    ],
    [
     "direct online",
     "100%",
     100
    ],
    [
     "tripster",
     "100%",
     100
    ]
   ],
   "bad": true,
   "why": "Every row shows 100% because ALL() is missing from the denominator, so each platform is divided by itself. Correct: others 40.9%, makeyourtrip 20.0%, logtrip 11.0%, direct online 9.9%, tripster 7.2%."
  }
 },
 "stakeholders": [
  {
   "id": "s1",
   "who": "Sunita Deshpande · Group Revenue Manager",
   "ask": "I need a dashboard to see how our hotels are doing.",
   "qs": [
    [
     "What decision will this dashboard help you make each week?",
     "obj",
     18,
     "Where to change prices and run offers: which city, which room class, which days."
    ],
    [
     "Who else will use it: you, the hotel GMs, or group leadership?",
     "scope",
     14,
     "Me and the 25 GMs. Leadership gets a one-page summary."
    ],
    [
     "What does 'doing well' mean for you: revenue, occupancy, or RevPAR?",
     "metric",
     18,
     "RevPAR first, then occupancy and ADR. Revenue alone hides empty rooms."
    ],
    [
     "Which hotels, cities and room classes are in scope?",
     "scope",
     10,
     "All 25 hotels in the 4 cities and all 4 room classes."
    ],
    [
     "Which period, and do you want week-over-week comparison?",
     "time",
     16,
     "May to July 2022, with week-over-week change on every main KPI."
    ],
    [
     "Which revenue counts: generated or realized?",
     "rules",
     14,
     "Realized. Cancelled bookings only keep 60%, and that's what we actually earn."
    ],
    [
     "Which days count as the weekend?",
     "rules",
     12,
     "Friday and Saturday. Use day_type from dim_date, not the calendar weekend."
    ],
    [
     "How often should it refresh?",
     "time",
     6,
     "Daily is ideal, weekly is the minimum."
    ],
    [
     "Which colour theme do you like?",
     "bad",
     -8,
     "Whatever is readable. (A question for later, not for scoping.)"
    ],
    [
     "Should I put every column on the dashboard?",
     "bad",
     -8,
     "No, only what supports pricing decisions."
    ],
    [
     "Can I build it from the Excel files instead of the database?",
     "bad",
     -6,
     "Use the database, so QA can reconcile."
    ]
   ]
  },
  {
   "id": "s2",
   "who": "Vikram Malhotra · Head of Distribution",
   "ask": "Which booking channel should we put more money into?",
   "qs": [
    [
     "What would you do differently depending on the answer?",
     "obj",
     18,
     "Shift commission budget between OTAs and grow direct online if it pays."
    ],
    [
     "Does 'best channel' mean most bookings, most revenue, or fewest cancellations?",
     "metric",
     18,
     "Revenue kept after cancellations. Volume alone isn't enough."
    ],
    [
     "Should I compare OTAs with direct online, or all platforms?",
     "scope",
     14,
     "All platforms, but direct online vs the OTAs is the key comparison."
    ],
    [
     "Do you want cancellation % and no-show % by platform too?",
     "metric",
     12,
     "Yes. A channel that cancels a lot costs us rooms we could have sold."
    ],
    [
     "Which period: the whole quarter, or month by month?",
     "time",
     16,
     "The full May–July period, plus a monthly trend."
    ],
    [
     "How should I treat the 'others' platform?",
     "rules",
     14,
     "Show it, but label it as unidentified. Don't treat it as a real channel."
    ],
    [
     "Should platform shares add to 100% across all platforms?",
     "rules",
     8,
     "Yes, share of all bookings."
    ],
    [
     "Should I split it by city and room class?",
     "scope",
     6,
     "City yes. Room class only if something stands out."
    ],
    [
     "Can I hide 'others' so the chart looks cleaner?",
     "bad",
     -8,
     "No. Hiding it makes every other share wrong."
    ],
    [
     "Should I build it in Excel, Tableau and Power BI?",
     "bad",
     -6,
     "One tool is enough for this question."
    ],
    [
     "Do you want a 3D pie chart?",
     "bad",
     -8,
     "No."
    ]
   ]
  },
  {
   "id": "s3",
   "who": "Arvind Menon · CFO",
   "ask": "Should the renovation budget go to our Luxury hotels?",
   "qs": [
    [
     "Is this for a budget decision or for a report?",
     "obj",
     18,
     "Budget: we're choosing where next year's renovation money goes."
    ],
    [
     "Should I compare total revenue, or revenue per hotel?",
     "metric",
     18,
     "Per hotel. We have 16 Luxury and only 9 Business hotels, so totals aren't fair."
    ],
    [
     "Should I add occupancy and RevPAR by category, not just revenue?",
     "metric",
     12,
     "Yes. I want to see if rooms are full as well as how much they earn."
    ],
    [
     "All 25 hotels, or only the ones on the renovation shortlist?",
     "scope",
     14,
     "All 25, with the shortlisted hotels highlighted."
    ],
    [
     "Which period should I use?",
     "time",
     16,
     "The full May–July 2022 data."
    ],
    [
     "Should revenue be realized revenue, after cancellations?",
     "rules",
     14,
     "Yes, revenue_realized only."
    ],
    [
     "Should occupancy come from the capacity table only?",
     "rules",
     10,
     "Yes. Capacity must be summed at its own grain, not after a join."
    ],
    [
     "Do you need it by city as well as by category?",
     "scope",
     8,
     "Yes. Mumbai is 39% of revenue, so show city next to category."
    ],
    [
     "Can I make it a 3D pie chart so it looks premium?",
     "bad",
     -6,
     "No. Two categories and per-hotel values read better as a simple bar."
    ],
    [
     "Should I include guest ratings in the revenue figure?",
     "bad",
     -8,
     "Ratings aren't money. Show them separately."
    ],
    [
     "Can I skip QA to deliver faster?",
     "bad",
     -10,
     "No. Finance numbers must reconcile."
    ]
   ]
  }
 ]
};
