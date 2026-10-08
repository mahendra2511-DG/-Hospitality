/* ============================================================
   Shodwe Hospitality Analytics — Project & Interview Prep
   data + rendering
   Built from a hotel booking dataset: dim_hotels, dim_rooms,
   dim_date, fact_bookings, fact_aggregated_bookings.
   ============================================================ */
const M_KPIS = [
  {
    "name": "Revenue",
    "desc": "Total realized revenue across every booking — the headline number, already net of cancellation deductions.",
    "formula": "SUM(fact_bookings[revenue_realized])",
    "table": "fact_bookings",
    "cat": "Revenue",
    "prio": "P1"
  },
  {
    "name": "ADR (Average Daily Rate)",
    "desc": "Average amount paid per room booked — the standard hospitality yardstick for pricing performance.",
    "formula": "DIVIDE([Revenue], [Total Bookings], 0)",
    "note": "Project definition. Industry standard uses Room Nights instead of Bookings.",
    "table": "fact_bookings",
    "cat": "Revenue",
    "prio": "P1"
  },
  {
    "name": "RevPAR (Revenue Per Available Room)",
    "desc": "Revenue spread across every available room, occupied or not — lets Shodwe compare properties of different sizes on equal footing.",
    "formula": "DIVIDE([Revenue], [Total Capacity])",
    "table": "fact_bookings, fact_aggregated_bookings",
    "cat": "Revenue",
    "prio": "P1"
  },
  {
    "name": "Realisation %",
    "desc": "The complement of Cancellation % and No Show rate % combined — the share of bookings that actually convert to a stay.",
    "formula": "1 − ([Cancellation %] + [No Show rate %])",
    "table": "fact_bookings",
    "cat": "Revenue",
    "prio": "P1"
  },
  {
    "name": "Total Bookings",
    "desc": "Every reservation made, regardless of final status — the base count for every rate KPI.",
    "formula": "COUNT(fact_bookings[booking_id])",
    "table": "fact_bookings",
    "cat": "Booking Volume & Status",
    "prio": "P2"
  },
  {
    "name": "Total Checked Out",
    "desc": "Bookings where the guest actually stayed — the only bookings that generate full realized revenue.",
    "formula": "CALCULATE([Total Bookings], fact_bookings[booking_status]=\"Checked Out\")",
    "table": "fact_bookings",
    "cat": "Booking Volume & Status",
    "prio": "P1"
  },
  {
    "name": "Total Cancelled Bookings",
    "desc": "Bookings cancelled before check-in — the BRD's Pain Point #5 (\"no clear visibility on cancellation patterns\") is built directly on this KPI.",
    "formula": "CALCULATE([Total Bookings], fact_bookings[booking_status]=\"Cancelled\")",
    "table": "fact_bookings",
    "cat": "Booking Volume & Status",
    "prio": "P1"
  },
  {
    "name": "Cancellation %",
    "desc": "Cancelled bookings as a share of all bookings — nearly a quarter of all bookings in this dataset.",
    "formula": "DIVIDE([Total Cancelled Bookings], [Total Bookings])",
    "table": "fact_bookings",
    "cat": "Booking Volume & Status",
    "prio": "P1"
  },
  {
    "name": "Total No Show Bookings",
    "desc": "Bookings where the guest neither cancelled nor showed up — the costliest outcome, since the room sits unsold with no advance warning.",
    "formula": "CALCULATE([Total Bookings], fact_bookings[booking_status]=\"No Show\")",
    "table": "fact_bookings",
    "cat": "Booking Volume & Status",
    "prio": "P1"
  },
  {
    "name": "No Show Rate %",
    "desc": "No-show bookings as a share of all bookings.",
    "formula": "DIVIDE([Total no show bookings], [Total Bookings])",
    "table": "fact_bookings",
    "cat": "Booking Volume & Status",
    "prio": "P2"
  },
  {
    "name": "Average Rating",
    "desc": "Average guest rating across every rated stay — a guest-satisfaction pulse check that sits alongside the revenue and occupancy numbers.",
    "formula": "AVERAGE(fact_bookings[ratings_given])",
    "table": "fact_bookings",
    "cat": "Booking Volume & Status",
    "prio": "P2"
  },
  {
    "name": "Total Capacity",
    "desc": "Total room-nights available to sell across all hotels and room types for the period.",
    "formula": "SUM(fact_aggregated_bookings[capacity])",
    "table": "fact_aggregated_bookings",
    "cat": "Occupancy & Capacity",
    "prio": "P2"
  },
  {
    "name": "Total Successful Bookings",
    "desc": "Total successful room-night bookings across all hotels and room types — the numerator of Occupancy %.",
    "formula": "SUM(fact_aggregated_bookings[successful_bookings])",
    "table": "fact_aggregated_bookings",
    "cat": "Occupancy & Capacity",
    "prio": "P1"
  },
  {
    "name": "Occupancy %",
    "desc": "Successful bookings as a share of total available capacity — the single most-watched hospitality KPI, and the BRD's Pain Point #2 (\"no real-time visibility into occupancy and revenue\") exists to fix.",
    "formula": "DIVIDE([Total Successful Bookings], [Total Capacity], 0)",
    "table": "fact_aggregated_bookings",
    "cat": "Occupancy & Capacity",
    "prio": "P1"
  },
  {
    "name": "No of Days",
    "desc": "Total days spanned by the dataset — May through July, 92 days — the denominator for every 'Daily' metric.",
    "formula": "DATEDIFF(MIN(dim_date[date]), MAX(dim_date[date]), DAY) + 1",
    "table": "dim_date",
    "cat": "Occupancy & Capacity",
    "prio": "P2"
  },
  {
    "name": "DBRN (Daily Booked Room Nights)",
    "desc": "Average number of rooms booked per day over the period — a daily-volume pulse check.",
    "formula": "DIVIDE([Total Bookings], [No of days])",
    "table": "fact_bookings, dim_date",
    "cat": "Occupancy & Capacity",
    "prio": "P2"
  },
  {
    "name": "DSRN (Daily Sellable Room Nights)",
    "desc": "Average number of rooms available to sell per day — the daily capacity baseline DBRN and DURN get measured against.",
    "formula": "DIVIDE([Total Capacity], [No of days])",
    "table": "fact_aggregated_bookings, dim_date",
    "cat": "Occupancy & Capacity",
    "prio": "P2"
  },
  {
    "name": "DURN (Daily Utilized Room Nights)",
    "desc": "Average number of rooms actually, successfully utilized (checked out) per day.",
    "formula": "DIVIDE([Total Checked Out], [No of days])",
    "table": "fact_bookings, dim_date",
    "cat": "Occupancy & Capacity",
    "prio": "P2"
  },
  {
    "name": "Booking % by Platform",
    "desc": "Share of total bookings coming from each booking platform (MakeYourTrip, LogTrip, Tripster, direct, etc.) — directly informs channel/commission strategy.",
    "formula": "DIVIDE([Total Bookings], CALCULATE([Total Bookings], ALL(fact_bookings[booking_platform]))) × 100",
    "table": "fact_bookings",
    "cat": "Mix Analysis",
    "prio": "P1"
  },
  {
    "name": "Booking % by Room Class",
    "desc": "Share of total bookings by room class (Standard, Elite, Premium, Presidential) — the BRD's KPI #9, \"Class Wise Revenue.\"",
    "formula": "DIVIDE([Total Bookings], CALCULATE([Total Bookings], ALL(dim_rooms[room_class]))) × 100",
    "table": "fact_bookings, dim_rooms",
    "cat": "Mix Analysis",
    "prio": "P2"
  },
  {
    "name": "Revenue WoW Change %",
    "desc": "Revenue this week vs. the prior week — the BRD's KPI #11, \"Weekly Trend – Key Metrics.\"",
    "formula": "DIVIDE(Revenue[current wk], Revenue[prior wk], 0) − 1",
    "table": "dim_date",
    "cat": "Week-over-Week Trends",
    "prio": "P1"
  },
  {
    "name": "Occupancy WoW Change %",
    "desc": "Occupancy % this week vs. the prior week.",
    "formula": "DIVIDE(Occupancy%[current wk], Occupancy%[prior wk], 0) − 1",
    "table": "dim_date",
    "cat": "Week-over-Week Trends",
    "prio": "P2"
  },
  {
    "name": "ADR WoW Change %",
    "desc": "Average Daily Rate this week vs. the prior week — an early pricing-drift signal.",
    "formula": "DIVIDE(ADR[current wk], ADR[prior wk], 0) − 1",
    "table": "dim_date",
    "cat": "Week-over-Week Trends",
    "prio": "P2"
  },
  {
    "name": "RevPAR WoW Change %",
    "desc": "RevPAR this week vs. the prior week.",
    "formula": "DIVIDE(RevPAR[current wk], RevPAR[prior wk], 0) − 1",
    "table": "dim_date",
    "cat": "Week-over-Week Trends",
    "prio": "P2"
  },
  {
    "name": "Realisation WoW Change %",
    "desc": "Realisation % this week vs. the prior week — tracks whether cancellation/no-show behaviour is trending better or worse.",
    "formula": "DIVIDE(Realisation%[current wk], Realisation%[prior wk], 0) − 1",
    "table": "dim_date",
    "cat": "Week-over-Week Trends",
    "prio": "P2"
  },
  {
    "name": "DSRN WoW Change %",
    "desc": "Daily Sellable Room Nights this week vs. the prior week — flags capacity changes (a hotel coming online/offline, a room block released).",
    "formula": "DIVIDE(DSRN[current wk], DSRN[prior wk], 0) − 1",
    "table": "dim_date",
    "cat": "Week-over-Week Trends",
    "prio": "P2"
  }
];
const M_KPI_CATS = ["All", "Revenue", "Booking Volume & Status", "Occupancy & Capacity", "Mix Analysis", "Week-over-Week Trends"];

/* ---------------- STATS (hero strip) ---------------- */
const M_STATS = [{"num": "134,590", "lbl": "Bookings (May–Jul)"}, {"num": "25", "lbl": "Hotels · 4 cities"}, {"num": "4", "lbl": "Room classes"}, {"num": "5", "lbl": "Source tables"}, {"num": "26", "lbl": "KPIs & DAX measures"}];

/* ---------------- DATA MODEL ---------------- */
const M_TABLES = [
  {
    "name": "dim_hotels",
    "type": "Dimension",
    "rows": "25",
    "pk": "property_id",
    "fk": "—"
  },
  {
    "name": "dim_rooms",
    "type": "Dimension",
    "rows": "4",
    "pk": "room_id",
    "fk": "—"
  },
  {
    "name": "dim_date",
    "type": "Dimension",
    "rows": "92",
    "pk": "date",
    "fk": "—"
  },
  {
    "name": "fact_bookings",
    "type": "Fact (hub)",
    "rows": "134,590",
    "pk": "booking_id",
    "fk": "property_id, check_in_date, room_category",
    "center": true
  },
  {
    "name": "fact_aggregated_bookings",
    "type": "Fact",
    "rows": "9,200",
    "pk": "— (property_id, check_in_date, room_category)",
    "fk": "property_id, check_in_date, room_category"
  }
];
const M_RELATIONSHIPS = ["fact_bookings → dim_hotels  (property_id, Many:1)", "fact_bookings → dim_date  (check_in_date = date, Many:1)", "fact_bookings → dim_rooms  (room_category = room_id, Many:1)", "fact_aggregated_bookings → dim_hotels  (property_id, Many:1)", "fact_aggregated_bookings → dim_date  (check_in_date = date, Many:1)", "fact_aggregated_bookings → dim_rooms  (room_category = room_id, Many:1)", "fact_bookings ↔ fact_aggregated_bookings  — joined on the composite key (property_id, check_in_date, room_category) in the vw_hotel_booking_analysis view, not a simple 1:1 key"];
const M_LOAD_ORDER = ["1. dim_hotels — 25 properties across 4 cities", "2. dim_rooms — 4 room types → 4 room classes", "3. dim_date — 92 days, May–Jul 2022, with wn and day_type calculated columns", "4. fact_bookings — 134,590 individual booking transactions", "5. fact_aggregated_bookings — 9,200 rows, pre-aggregated by property/date/room-type for Occupancy % and RevPAR"];
const M_NULL_NOTES = ["fact_bookings.ratings_given is populated for only 56,683 of 134,590 rows (~42%) — guests who cancelled or no-showed never left a rating, which is an expected null, not a data-quality problem. Average Rating must implicitly (AVERAGE() already does this) skip the blanks rather than treating them as 0.", "fact_bookings carries 10 columns beyond what the metadata file documents — customer_id, payment_method, stay_duration, cancellation_reason, is_loyalty_member, country, customer_age, special_requests, discount_applied, booking_channel. These are genuinely present in the file and usable, they're just undocumented in the source hand-off — a realistic 'read the actual file, not just the data dictionary' situation.", "fact_aggregated_bookings has no single-column primary key — its grain is one row per (property_id, check_in_date, room_category) combination, and that's also the exact composite join key used to connect it back to fact_bookings in the mart view.", "dim_hotels has 16 Luxury properties and 9 Business properties (25 total) — an intentionally uneven split worth knowing before someone asks why Luxury dominates the Revenue by Category chart.", "Total Successful Bookings (from fact_aggregated_bookings, 134,590) happens to equal Total Bookings (from fact_bookings, also 134,590) in this dataset — that's a coincidence of how the sample data was generated, not a guaranteed identity; don't assume the two will always match in a different dataset.", "dim_date.day_type is calculated with a business-specific rule — Friday and Saturday count as 'Weekend', Sunday through Thursday as 'Weekday' — different from the calendar-standard Saturday/Sunday weekend, because that's literally what the stakeholder specified. Getting this rule wrong silently breaks every Weekday vs Weekend KPI."];
const M_GOTCHAS = [
  { t: "Friday + Saturday = \"Weekend\"", d: "dim_date.day_type uses a business-specific rule — Friday and Saturday, not the calendar-standard Saturday/Sunday. Every Weekday-vs-Weekend KPI is silently wrong if you rebuild this with a generic DATENAME('weekday', ...) or a textbook formula instead of the stakeholder's actual definition." },
  { t: "Two fact tables, two grains", d: "fact_bookings is one row per individual booking; fact_aggregated_bookings is one row per property × date × room_category. They join on a 3-column composite key. Dropping room_category from that join silently fans out or drops rows and quietly breaks Occupancy % and RevPAR." },
  { t: "ratings_given is null on purpose", d: "Only ~42% of fact_bookings rows have a rating — guests who cancelled or no-showed never left one. That's an expected null, not a data-quality problem, and AVERAGE() already skips blanks correctly. Don't \"fix\" it by imputing zeros." },
  { t: "revenue_realized ≠ revenue_generated", d: "Cancelled bookings retain only 60% of revenue_generated (40% is refunded); Checked Out and No Show bookings keep 100%. That logic is already baked into revenue_realized — summing revenue_generated instead silently overstates actual revenue." },
  { t: "Total Successful Bookings == Total Bookings — coincidence, not a rule", d: "In this sample, fact_aggregated_bookings' successful_bookings sum (134,590) happens to equal fact_bookings' total row count (134,590). That's specific to how this sample was generated — don't assume the two will always tie out in a different dataset, and don't build a QA check that silently passes because of it." },
  { t: "ADR: bookings vs room nights — the classic trap", d: "This project's own KPI register defines ADR as Revenue ÷ Total Bookings. In real hospitality practice ADR is usually Revenue ÷ room nights (stay_duration summed), so a 3-night booking should count as 3, not 1. Know which definition you're using and be ready to explain the difference — interviewers ask this specifically to see if you'll default to the textbook answer without checking the actual measure." },
  { t: "\"Others\" is the single biggest booking platform", d: "41% of bookings (55,066 of 134,590) fall into an unnamed \"others\" platform bucket — bigger than any named OTA. Treat that as a data-quality gap to flag, not a channel-strategy insight to act on at face value." },
];

const M_CALC_FIELDS = ["wn (dim_date) — WEEKNUM(dim_date[date]) — powers every Week-over-Week KPI", "day_type (dim_date) — IF(WEEKDAY(date,1) > 5, \"Weekend\", \"Weekday\") — Friday/Saturday = Weekend per stakeholder rule, not the calendar default", "room_class (via dim_rooms) — maps RT1–RT4 to Standard / Elite / Premium / Presidential", "hotel_category (via dim_hotels) — Luxury / Business, used for Revenue by Category and Class Wise Revenue visuals"];
const M_JOIN_GUIDE = [["DIM", "dim_hotels", "property_id", "—", "fact_bookings, fact_aggregated_bookings (1:Many)", "1 row per hotel — 25 rows, 4 cities"], ["DIM", "dim_rooms", "room_id", "—", "fact_bookings.room_category, fact_aggregated_bookings.room_category", "1 row per room type — 4 rows"], ["DIM", "dim_date", "date", "—", "fact_bookings.check_in_date, fact_aggregated_bookings.check_in_date", "1 row per day — 92 rows, May–Jul 2022"], ["FACT", "fact_bookings", "booking_id", "property_id, check_in_date, room_category", "dim_hotels, dim_date, dim_rooms", "1 row per individual booking — 134,590 rows"], ["FACT", "fact_aggregated_bookings", "— (composite)", "property_id, check_in_date, room_category", "dim_hotels, dim_date, dim_rooms, fact_bookings (composite)", "1 row per property × date × room type — 9,200 rows"]];
const M_JOIN_PATHS = [["Bookings by hotel", "fact_bookings[property_id] = dim_hotels[property_id]"], ["Bookings by date", "fact_bookings[check_in_date] = dim_date[date]"], ["Bookings by room class", "fact_bookings[room_category] = dim_rooms[room_id]"], ["Occupancy / RevPAR join", "fact_bookings[property_id, check_in_date, room_category] = fact_aggregated_bookings[property_id, check_in_date, room_category]"], ["Full mart view", "fact_bookings LEFT JOIN dim_hotels, dim_date, dim_rooms, fact_aggregated_bookings — exactly vw_hotel_booking_analysis"]];
const M_GLOBAL_FILTERS = [["Date Range", "dim_date.date"], ["Day Type", "dim_date.day_type (Weekday / Weekend)"], ["City", "dim_hotels.city"], ["Hotel Category", "dim_hotels.category (Luxury / Business)"], ["Property", "dim_hotels.property_name"], ["Room Class", "dim_rooms.room_class"], ["Booking Status", "fact_bookings.booking_status"], ["Booking Platform", "fact_bookings.booking_platform"]];
const M_DASHBOARDS = [["1", "Booking & Occupancy Overview", "Revenue Manager, GM, Hotel Group Leadership", "Revenue, Occupancy %, ADR, RevPAR, Total Bookings, Cancellation %", "KPI Cards w/ WoW trend arrows, Revenue by City/Category bar, Room Class donut, Weekday vs Weekend comparison, Weekly trend line"]];

/* ---------------- DATA DICTIONARY ---------------- */
const M_DATA_DICTIONARY = [
  {
    "table": "dim_hotels",
    "rows": "25 rows",
    "cols": [
      [
        "property_id",
        "Integer",
        "Unique ID for each hotel (PK)",
        "—"
      ],
      [
        "property_name",
        "String",
        "Hotel name",
        "All 25 are branded 'Shodwe ___' — e.g. Shodwe Grands, Shodwe Exotica, Shodwe City"
      ],
      [
        "category",
        "String",
        "Luxury or Business",
        "16 Luxury, 9 Business — an intentionally uneven split"
      ],
      [
        "city",
        "String",
        "City the property is located in",
        "4 cities: Mumbai (8), Hyderabad (6), Bangalore (6), Delhi (5)"
      ]
    ]
  },
  {
    "table": "dim_rooms",
    "rows": "4 rows",
    "cols": [
      [
        "room_id",
        "String",
        "Room type code — RT1 to RT4 (PK)",
        "—"
      ],
      [
        "room_class",
        "String",
        "Standard / Elite / Premium / Presidential",
        "RT1=Standard, RT2=Elite, RT3=Premium, RT4=Presidential"
      ]
    ]
  },
  {
    "table": "dim_date",
    "rows": "92 rows",
    "cols": [
      [
        "date",
        "Date",
        "Calendar date (PK)",
        "Spans May, June, July 2022"
      ],
      [
        "mmm yy",
        "String",
        "Month name + year label",
        "e.g. 'May 22' — used for month-level trend axes"
      ],
      [
        "week no",
        "String",
        "ISO-style week label",
        "e.g. 'W 19' — feeds every Week-over-Week KPI via the wn calculated column"
      ],
      [
        "day_type",
        "String",
        "Weekend or Weekday",
        "Business rule: Friday+Saturday = Weekend, Sunday–Thursday = Weekday — not the calendar default"
      ]
    ]
  },
  {
    "table": "fact_bookings",
    "rows": "134,590 rows — main transactional fact table",
    "cols": [
      [
        "booking_id",
        "String",
        "Unique booking identifier (PK)",
        "—"
      ],
      [
        "property_id",
        "Integer",
        "FK → dim_hotels",
        "—"
      ],
      [
        "booking_date",
        "String",
        "Date the reservation was made",
        "—"
      ],
      [
        "check_in_date / checkout_date",
        "Date",
        "Stay period",
        "FK → dim_date via check_in_date"
      ],
      [
        "no_guests",
        "Integer",
        "Number of guests on this booking",
        "—"
      ],
      [
        "room_category",
        "String",
        "FK → dim_rooms (RT1–RT4)",
        "—"
      ],
      [
        "booking_platform",
        "String",
        "Where the booking was made",
        "7 platforms: others, makeyourtrip, logtrip, direct online, tripster, journey, direct offline"
      ],
      [
        "ratings_given",
        "Decimal",
        "Guest rating, 1–5",
        "Only populated for Checked Out stays — ~42% of rows"
      ],
      [
        "booking_status",
        "String",
        "Checked Out / Cancelled / No Show",
        "94,411 Checked Out, 33,420 Cancelled, 6,759 No Show"
      ],
      [
        "revenue_generated",
        "Integer",
        "Full booking value before any cancellation deduction",
        "—"
      ],
      [
        "revenue_realized",
        "Integer",
        "Actual revenue kept by the hotel",
        "= revenue_generated for Checked Out/No Show; 60% of revenue_generated for Cancelled (the metadata's stated 40% cancellation deduction)"
      ],
      [
        "customer_id / customer_age / country",
        "Integer/String",
        "Guest identity attributes",
        "Not documented in the metadata file — present in the actual workbook"
      ],
      [
        "payment_method / booking_channel",
        "String",
        "How the booking was paid for / routed",
        "Undocumented bonus columns"
      ],
      [
        "stay_duration",
        "Integer",
        "Nights stayed",
        "Undocumented bonus column"
      ],
      [
        "cancellation_reason",
        "String",
        "Free-text reason, only for Cancelled bookings",
        "Undocumented bonus column"
      ],
      [
        "is_loyalty_member",
        "Boolean",
        "Whether the guest is a loyalty programme member",
        "Undocumented bonus column"
      ],
      [
        "special_requests / discount_applied",
        "String/Decimal",
        "Guest-specific notes and discount amount",
        "Undocumented bonus columns"
      ]
    ]
  },
  {
    "table": "fact_aggregated_bookings",
    "rows": "9,200 rows — pre-aggregated fact table",
    "cols": [
      [
        "property_id",
        "Integer",
        "FK → dim_hotels",
        "—"
      ],
      [
        "check_in_date",
        "Date",
        "FK → dim_date",
        "—"
      ],
      [
        "room_category",
        "String",
        "FK → dim_rooms",
        "—"
      ],
      [
        "successful_bookings",
        "Integer",
        "Count of successful bookings for this property/date/room-type",
        "Feeds Occupancy % numerator"
      ],
      [
        "capacity",
        "Integer",
        "Maximum rooms available for this property/date/room-type",
        "Feeds Occupancy % and RevPAR denominators"
      ]
    ]
  }
];

/* ---------------- SAMPLE DASHBOARD DATA (real computed values) ---------------- */
const M_CHART_COLORS = ["#0D9488", "#7C3AED", "#DC1F26", "#5B6472", "#F6C445", "#7FB6A8"];
const M_DASH_MOCKS = [
  {
    "title": "Booking & Occupancy Overview — Headline KPIs",
    "sub": "Computed directly from the real dataset — 134,590 bookings across 25 hotels, May–Jul 2022",
    "kpis": [
      {
        "v": "$1.71B",
        "l": "Revenue (realized)"
      },
      {
        "v": "57.9%",
        "l": "Occupancy %"
      },
      {
        "v": "$12,696",
        "l": "ADR"
      },
      {
        "v": "$7,347",
        "l": "RevPAR"
      }
    ],
    "donuts": [
      {
        "title": "Booking Status Mix",
        "data": [
          [
            "Checked Out",
            94411
          ],
          [
            "Cancelled",
            33420
          ],
          [
            "No Show",
            6759
          ]
        ]
      }
    ],
    "bars": [
      {
        "title": "Revenue by City",
        "prefix": "$",
        "data": [
          [
            "Mumbai",
            668640991
          ],
          [
            "Bangalore",
            420397050
          ],
          [
            "Hyderabad",
            325232870
          ],
          [
            "Delhi",
            294500318
          ]
        ]
      }
    ]
  },
  {
    "title": "Booking & Occupancy Overview — Cancellation & Room Mix",
    "sub": "Computed directly from the dataset — booking status and room class breakdown",
    "kpis": [
      {
        "v": "24.8%",
        "l": "Cancellation %"
      },
      {
        "v": "5.0%",
        "l": "No Show Rate %"
      },
      {
        "v": "70.2%",
        "l": "Realisation %"
      },
      {
        "v": "3.62 / 5",
        "l": "Avg Rating (rated stays)"
      }
    ],
    "donuts": [
      {
        "title": "Booking % by Room Class",
        "data": [
          [
            "Elite",
            49505
          ],
          [
            "Standard",
            38446
          ],
          [
            "Premium",
            30566
          ],
          [
            "Presidential",
            16073
          ]
        ]
      }
    ],
    "bars": [
      {
        "title": "Booking % by Platform — Top 5",
        "data": [
          [
            "others",
            55066
          ],
          [
            "makeyourtrip",
            26898
          ],
          [
            "logtrip",
            14756
          ],
          [
            "direct online",
            13379
          ],
          [
            "tripster",
            9630
          ]
        ]
      }
    ]
  },
  {
    "title": "Booking & Occupancy Overview — Category & Capacity",
    "sub": "Computed directly from the dataset — Luxury vs Business, and daily room metrics",
    "kpis": [
      {
        "v": "1,463",
        "l": "DBRN (Daily Booked Room Nights)"
      },
      {
        "v": "2,528",
        "l": "DSRN (Daily Sellable Room Nights)"
      },
      {
        "v": "1,026",
        "l": "DURN (Daily Utilized Room Nights)"
      },
      {
        "v": "92 days",
        "l": "No of Days (May–Jul)"
      }
    ],
    "donuts": [
      {
        "title": "Hotels by Category",
        "data": [
          [
            "Luxury",
            16
          ],
          [
            "Business",
            9
          ]
        ]
      }
    ],
    "bars": [
      {
        "title": "Revenue by Category",
        "prefix": "$",
        "data": [
          [
            "Luxury",
            1052751932
          ],
          [
            "Business",
            656019297
          ]
        ]
      }
    ]
  }
];

/* ---------------- SQL & QA LAB ---------------- */
const M_SQL_BLOCKS = [
  {
    "title": "1 · Data Count Validation",
    "desc": "Confirm record counts match between the database and the Power BI / Tableau reports.",
    "sql": "SELECT COUNT(*) FROM dim_hotels;                 -- expect 25\nSELECT COUNT(*) FROM dim_rooms;                  -- expect 4\nSELECT COUNT(*) FROM dim_date;                   -- expect 92\nSELECT COUNT(*) FROM fact_bookings;               -- expect 134,590\nSELECT COUNT(*) FROM fact_aggregated_bookings;    -- expect 9,200"
  },
  {
    "title": "2 · Data Completeness Check",
    "desc": "Identify missing or invalid values — and know which nulls (ratings on cancelled stays) are expected vs which (ratings missing on a Checked Out stay) are real gaps.",
    "sql": "SELECT * FROM fact_bookings WHERE property_id IS NULL OR check_in_date IS NULL OR room_category IS NULL;\nSELECT * FROM fact_bookings WHERE booking_status NOT IN ('Checked Out','Cancelled','No Show');\n-- Note: ratings_given IS NULL for cancelled/no-show bookings is EXPECTED — do not flag as missing data\nSELECT COUNT(*) FROM fact_bookings WHERE ratings_given IS NULL AND booking_status = 'Checked Out';\n-- this one SHOULD be investigated: a Checked Out stay with no rating is a genuine gap, unlike a cancelled one"
  },
  {
    "title": "3 · Data Consistency Check",
    "desc": "Confirm every fact_bookings row has a valid parent dimension row — all three queries should return 0 rows.",
    "sql": "SELECT fb.property_id\nFROM fact_bookings fb\nLEFT JOIN dim_hotels dh ON fb.property_id = dh.property_id\nWHERE dh.property_id IS NULL;  -- Should return 0 rows\n\nSELECT fb.room_category\nFROM fact_bookings fb\nLEFT JOIN dim_rooms dr ON fb.room_category = dr.room_id\nWHERE dr.room_id IS NULL;  -- Should return 0 rows\n\nSELECT fb.check_in_date\nFROM fact_bookings fb\nLEFT JOIN dim_date dd ON fb.check_in_date = dd.date\nWHERE dd.date IS NULL;  -- Should return 0 rows"
  },
  {
    "title": "4 · Duplicate Records Check",
    "desc": "Identify duplicate entries by primary key (fact_bookings) and by grain (fact_aggregated_bookings' composite key).",
    "sql": "SELECT booking_id, COUNT(*)\nFROM fact_bookings\nGROUP BY booking_id\nHAVING COUNT(*) > 1;\n\nSELECT property_id, check_in_date, room_category, COUNT(*)\nFROM fact_aggregated_bookings\nGROUP BY property_id, check_in_date, room_category\nHAVING COUNT(*) > 1;\n-- this composite key IS fact_aggregated_bookings' grain — any duplicate here is a real ETL bug"
  },
  {
    "title": "5 · Dashboard Aggregation Check",
    "desc": "Compare SQL sum/average output against the equivalent Power BI or Tableau card — the actual DAX-equivalent values this dataset should produce.",
    "sql": "SELECT SUM(revenue_realized) FROM fact_bookings;                                 -- Revenue ≈ $1.71B\nSELECT SUM(revenue_realized)*1.0 / COUNT(booking_id) FROM fact_bookings;         -- ADR ≈ $12,696\nSELECT SUM(successful_bookings)*100.0 / SUM(capacity) FROM fact_aggregated_bookings; -- Occupancy % ≈ 57.9%\nSELECT COUNT(*)*100.0 / (SELECT COUNT(*) FROM fact_bookings)\n  FROM fact_bookings WHERE booking_status = 'Cancelled';                        -- Cancellation % ≈ 24.8%\nSELECT SUM(revenue_realized) / SUM(capacity)\n  FROM fact_bookings fb JOIN fact_aggregated_bookings fab\n    ON fb.property_id=fab.property_id AND fb.check_in_date=fab.check_in_date\n    AND fb.room_category=fab.room_category;                                    -- RevPAR ≈ $7,347"
  },
  {
    "title": "6 · The Mart View",
    "desc": "The exact vw_hotel_booking_analysis view specified in this project's Data Model — this is what Power BI and Tableau actually connect to, not the raw fact tables.",
    "sql": "-- The exact mart view this project's BRD specifies:\nCREATE OR REPLACE VIEW vw_hotel_booking_analysis AS\nSELECT\n    fb.booking_id,\n    fb.property_id,\n    dh.property_name,\n    dh.category AS hotel_category,\n    dh.city,\n    fb.check_in_date,\n    dd.\"mmm yy\" AS check_in_month,\n    dd.\"week no\" AS check_in_week,\n    dd.day_type AS check_in_day_type,\n    fb.checkout_date,\n    fb.no_guests,\n    fb.room_category,\n    dr.room_id,\n    fb.booking_platform,\n    fb.ratings_given,\n    fb.booking_status,\n    fb.revenue_generated,\n    fb.revenue_realized,\n    fab.successful_bookings,\n    fab.capacity\nFROM fact_bookings fb\nLEFT JOIN dim_hotels dh ON fb.property_id = dh.property_id\nLEFT JOIN dim_date dd ON fb.check_in_date = dd.date\nLEFT JOIN dim_rooms dr ON fb.room_category = dr.room_class\nLEFT JOIN fact_aggregated_bookings fab\n    ON fb.property_id = fab.property_id\n    AND fb.check_in_date = fab.check_in_date\n    AND fb.room_category = fab.room_category;"
  }
];

/* ---------------- PROBLEM STATEMENT ---------------- */
const M_PROBLEM_STATEMENT = [
  { icon: "1", ok: false, h: "Inconsistent, Manual Reporting", p: "Reports were built manually in Excel by each property, leading to inconsistent KPIs and definitions across the hotel group." },
  { icon: "2", ok: false, h: "No Real-Time Visibility", p: "Management lacked real-time visibility into occupancy and revenue, forcing reactive rather than proactive decisions." },
  { icon: "3", ok: false, h: "No Centralized Cross-Property View", p: "There was no centralized view across hotels — state-wise and property-wise performance was difficult to compare at a glance." },
  { icon: "4", ok: false, h: "Weekday vs Weekend Trends Untracked", p: "Weekend vs weekday booking trends were not tracked at all, making pricing optimization for peak days effectively impossible." },
  { icon: "5", ok: false, h: "No Room Category or Cancellation Insight", p: "There was no clear visibility on room category performance or cancellation patterns — both directly cost the business realized revenue." },
];

/* ---------------- TOOLS ---------------- */
const M_TOOLS = [
  { logo: "assets/excel-logo.jpg", name: "Excel", role: "Stage 1 · Work directly on the data", desc: "Work with the raw dim_hotels / dim_rooms / dim_date / fact_bookings / fact_aggregated_bookings export here — clean it, and build a first-pass pivot dashboard with the core Revenue, Occupancy % and Cancellation % KPIs before touching a database." },
  { logo: "assets/mysql-logo.png", name: "SQL", role: "Stage 2 · Load it into a database", desc: "Load the cleaned tables into SQL and build vw_hotel_booking_analysis — the pre-joined mart view that pulls hotel, date and room attributes onto every booking row." },
  { logo: "assets/tableau-logo.jpg", name: "Tableau", role: "Stage 3 · Connect to SQL, not the file", desc: "Tableau connects to SQL as its data source, not the raw Excel/CSV files, and builds the Booking & Occupancy dashboard with weekday/weekend and property-level breakdowns." },
  { logo: "assets/powerbi-logo.png", name: "Power BI", role: "Stage 4 · Connect to SQL, not the file", desc: "Power BI connects to the same SQL source, models the relationships around fact_bookings, and implements all 25 DAX measures from the metrics register — including the Week-over-Week trend measures." },
  { logo: "assets/sia-avatar.png", name: "AI / Insights", role: "Stage 4 (optional) · Ask the warehouse a question", desc: "An optional natural-language layer on top of the same warehouse — a Copilot/Power BI Q&A visual, or a simple chatbot wired to your KPI queries — that lets a revenue manager type \"what's our occupancy this week?\" and get an answer, without a separate copy of the data." },
  { logo: "assets/mysql-logo.png", name: "QA / SQL", role: "Stage 5 · Match backend to dashboard", desc: "Run SQL directly against the mart view and reconcile every KPI — Revenue, Occupancy %, ADR, RevPAR, Cancellation % — against what Tableau and Power BI display." },
];

/* ---------------- DOMAIN PRIMER ---------------- */
const M_DOMAIN_WHAT = "Hospitality analytics turns the trail every booking, cancellation and no-show leaves behind into a measurable picture of a hotel group's performance. Instead of each property building its own inconsistent Excel report, one connected dataset lets Shodwe Group see occupancy and revenue in real time, compare properties and cities on equal footing, and finally answer the questions manual reporting couldn't — which room categories perform best, how weekday and weekend demand actually differ, and where cancellations are quietly eating into revenue.";

const M_DOMAIN_WHERE = [
  "Hotel chains & hospitality groups — comparing occupancy, ADR and RevPAR across properties, cities and room categories on one consistent standard.",
  "Revenue management teams — pricing decisions driven by weekday/weekend demand patterns and week-over-week trend data, not gut feel.",
  "Online travel agency (OTA) partnerships — understanding which booking platforms (MakeYourTrip, LogTrip, direct channels) actually drive volume and value.",
  "Guest experience & operations — cancellation and no-show pattern analysis to reduce revenue leakage and improve forecasting accuracy.",
];

const M_DOMAIN_DATA_TYPES = [
  "Booking transactions", "Room availability & capacity", "Property & room-type attributes", "Booking platform & channel data",
  "Guest ratings", "Cancellation & no-show records", "Calendar & weekday/weekend data", "Revenue (generated vs. realized)",
];

const M_FLOW = [
  { t: "Data Preparation", d: "Use the provided CSV/XLSX export to build an initial Excel dashboard; clean and transform the data, and define the 25 KPIs/measures up front from the metrics register." },
  { t: "SQL Integration", d: "Load dim_hotels, dim_rooms, dim_date, fact_bookings and fact_aggregated_bookings into a normalized SQL schema; set primary/foreign keys, including fact_aggregated_bookings' composite grain." },
  { t: "BI Tool Connection", d: "Connect Tableau & Power BI to SQL; build the model around fact_bookings, implement the wn and day_type calculated columns, then build vw_hotel_booking_analysis." },
  { t: "Dashboard Development", d: "Design the Booking & Occupancy Overview dashboard with KPI cards (with WoW trend arrows), Revenue by City/Category, Room Class mix, and Weekday vs Weekend comparisons." },
  { t: "QA & Validation", d: "Compare database records against dashboard visuals end-to-end — Occupancy %, RevPAR, Cancellation % — and validate the Friday/Saturday weekend rule specifically." },
];

const M_TIMELINE = [
  { d: "Week 1", t: "", task: "Project kick-off — BRD & metrics register walkthrough" },
  { d: "Week 1-2", t: "", task: "Implement core KPIs in Excel — Revenue, Occupancy %, Cancellation %" },
  { d: "Week 2-3", t: "", task: "SQL schema setup + vw_hotel_booking_analysis mart view" },
  { d: "Week 3-4", t: "", task: "Dashboard development — Tableau & Power BI, all 25 KPIs" },
  { d: "Week 4-5", t: "", task: "QA & reconciliation, final presentation prep" },
];

/* ---------------- RULES & REGULATIONS ---------------- */
const M_RULES = [
  { icon: "⚠", ok: false, h: "Attendance is mandatory", p: "Missing more than two meetings results in removal from the project. Join every meeting under the same name you registered with — an unrecognized name gets marked absent." },
  { icon: "⚠", ok: false, h: "Attendance alone isn't enough", p: "Sitting in on meetings without actively contributing will also lead to removal. Participation is graded on contribution, not presence." },
  { icon: "✓", ok: true, h: "Flag non-contributing teammates early", p: "If a team member isn't contributing, it's on the group to inform management — by call, WhatsApp, email, or during the weekly review — rather than letting it slide." },
  { icon: "✓", ok: true, h: "Contribute across every tool", p: "You're expected to contribute to Excel, SQL, Tableau, Power BI, and the final PPT. Skipping even one tool entirely puts your place on the project at risk." },
  { icon: "✓", ok: true, h: "Weekly review presentations", p: "Each group presents its progress every week — consistent updates and a prepared walkthrough are expected, not just a working dashboard at the end." },
];

const M_FOCUS_AREAS = [
  { n: "", h: "Active Contribution", p: "Show up engaged — participate in discussion, don't just observe the build." },
  { n: "", h: "Sharing Insights", p: "Bring your own observations to the team rather than waiting to be assigned tasks." },
  { n: "", h: "Timely Completion", p: "Deliver assigned work inside the agreed deadline, every sprint." },
  { n: "", h: "Collaboration Over Competition", p: "Optimize for the team's dashboard, not for individual credit." },
  { n: "", h: "Clear Communication", p: "Say what you're blocked on before the deadline, not after." },
  { n: "", h: "Active Listening", p: "Actually absorb teammates' updates in review meetings — you'll be asked about their work too." },
  { n: "", h: "Recognizing Contributions", p: "Acknowledge teammates' work — it costs nothing and keeps morale up." },
  { n: "", h: "Daily Team Connectivity", p: "A short daily check-in catches blockers before they become a missed deadline." },
];

/* ---------------- SOCIAL LINKS ---------------- */
const M_SOCIAL = {
  linkedin: "https://www.linkedin.com/in/mahendra-singh-%F0%9F%87%AE%F0%9F%87%B3%F0%9F%9A%80%E2%9D%84%EF%B8%8F-%F0%9F%90%8D-%F0%9F%A6%84-83699485/",
  medium: "https://medium.com/@mahendraa1188",
  youtube: "https://www.youtube.com/channel/UC2q-vZWSlQpiGiMcSLUqnIg",
};

const M_CRACKANALYTICS_URL = "https://www.crackanalytics.com/";


/* ---------------- SETUP & SOFTWARE DOWNLOADS ---------------- */
const M_SOFTWARE_LINKS = [
  { name: "How to import a CSV into MySQL", desc: "Step-by-step guide — load the dataset before connecting Tableau or Power BI", icon: "🗄️", type: "link", href: "https://medium.com/@mahendraa1188/how-to-import-csv-into-mysql-c3bbce297910" },
  { name: "Tableau Desktop — free download", desc: "Official installer from Tableau (free trial / Public edition)", icon: "📈", type: "link", href: "https://www.tableau.com/products/desktop-free/download" },
  { name: "Power BI Desktop — free download", desc: "Official installer from Microsoft", icon: "⚡", type: "link", href: "https://www.microsoft.com/en-us/download/details.aspx?id=58494" },
];

const M_DOCUMENTS = [
  { name: "Excel Starter Template.xlsx", desc: "A ready-to-use workbook with live SUMIFS/COUNTIFS formulas for Booking Volume, Cancellation %, Realisation %, ADR and Avg Rating — paste your export into Raw_Data and the Dashboard tab updates itself", icon: "🧮", type: "download", href: "assets/docs/Shodwe_Hospitality_Excel_Starter.xlsx", filename: "Shodwe_Hospitality_Excel_Starter.xlsx" }
];

/* ---------------- INTERVIEW PREP ---------------- */
const M_QA_CATS = ["Explain This Project", "SQL", "Power BI & DAX", "Tableau", "Data Modeling", "Hospitality Domain", "Scenario-Based", "General & HR", "Rapid Fire"];

const M_QA = [
  // ---------------- Explain This Project ----------------
  { cat: "Explain This Project", q: "Explain this project to me — what did you actually build?", a: "Structure it as a story: (1) the data — 134,590 real bookings across 25 Shodwe Group hotels in 4 cities over 92 days (May–Jul), plus a 9,200-row pre-aggregated occupancy table; (2) the tools — Excel for first-pass prep, SQL for a mart view, Tableau and Power BI for the dashboard; (3) the challenge you hit and how you solved it; (4) the outcome — a Booking & Occupancy dashboard covering 25 KPIs, from headline Revenue and Occupancy % down to week-over-week trend measures. Keep it under two minutes.", signal: "Almost always the first question — tests structure and communication before anything technical." },
  { cat: "Explain This Project", q: "What was the business problem this project was solving?", a: "Shodwe Group, a big hospitality chain, was building reports manually in Excel per property — leading to inconsistent KPIs, no real-time occupancy/revenue visibility, no centralized cross-property view, untracked weekday/weekend demand patterns, and no visibility into room-category or cancellation trends. One dashboard, backed by a single governed data model, replaces five separate blind spots at once.", signal: "Tests whether you can state the 'why' behind the project, tied to the specific pain points named in the brief." },
  { cat: "Explain This Project", q: "What kind of work did you personally do on this project?", a: "Be specific: which KPI category you built (Revenue, Occupancy & Capacity, Mix Analysis, or the Week-over-Week trend measures), which dashboard visual was yours, and which QA queries you ran. Vague answers like 'I worked on the dashboard' read as someone who watched rather than built.", signal: "Tests whether you can separate your individual contribution from the group's." },
  { cat: "Explain This Project", q: "What data did you use, and where did it come from?", a: "Name the scale precisely: a 5-table hospitality dataset — dim_hotels (25 properties), dim_rooms (4 room classes), dim_date (92 days, May–Jul), fact_bookings (134,590 individual bookings), and fact_aggregated_bookings (9,200 pre-computed occupancy rows) — for an imaginary hotel group called Shodwe. Precision here signals you understand the data, not just the charts built on top of it.", signal: "Tests whether 'hotel booking data' gets replaced with real numbers." },
  { cat: "Explain This Project", q: "Why does this dataset include both fact_bookings and a separate fact_aggregated_bookings table — isn't that redundant?", a: "They answer different questions at different grains. fact_bookings is transactional — one row per individual booking, needed for anything guest-level (ratings, cancellation reasons, booking platform). fact_aggregated_bookings is pre-computed at the property/date/room-type grain specifically to make Occupancy % and RevPAR fast and simple — those two KPIs need 'how many rooms were available' (capacity), a number that doesn't exist anywhere in fact_bookings itself. It's not redundant; it's two different units of analysis serving two different KPI families.", signal: "Tests understanding of why a second, differently-grained fact table exists rather than assuming duplication." },

  { cat: "Explain This Project", q: "Walk me through the end-to-end pipeline from raw files to the final dashboard.", a: "1. Raw CSVs/Excel land from the PMS. 2. Data is loaded and cleaned in SQL (or first-pass cleaned in Excel). 3. We build the star schema and the mart view vw_hotel_booking_analysis. 4. Tableau and Power BI connect only to that mart view. 5. KPIs are implemented as measures. 6. QA runs the same SQL against the warehouse and reconciles every number on the dashboard. Nothing goes directly from Excel to the BI tools — that is the governed path.", signal: "Shows the candidate understands the full flow, not just one tool." },
  { cat: "Explain This Project", q: "What would you improve in this project if you had two more weeks?", a: "Three things: 1) Replace the simplified ADR (Revenue ÷ Bookings) with true room-night ADR. 2) Add a proper booking-pace / on-the-books view so revenue managers can see future demand. 3) Implement basic row-level security so each property manager only sees their own hotel. Those three changes would make the dashboard production-ready instead of training-ready.", signal: "Shows self-awareness and product thinking." },

  // ---------------- SQL ----------------
  { cat: "SQL", q: "How did you connect SQL to Tableau and Power BI in this project?", a: "We never pointed Tableau or Power BI at the raw Excel files. The five source tables were loaded into MySQL, cleaned, and exposed through a single governed mart view — vw_hotel_booking_analysis. Both BI tools connect only to that view (Import mode in Power BI, Extract or Live in Tableau). This gives one source of truth and makes QA simple: the same SQL that feeds the dashboard is what we run to reconcile every number.", signal: "Shows the candidate understands governed architecture instead of \"I just connected the Excel file.\"" },
  { cat: "SQL", q: "What problem did you face while working on this project, and how did you resolve it?", a: "Name something concrete: e.g. Occupancy % coming out wrong because you joined fact_bookings to fact_aggregated_bookings on property_id and check_in_date alone, silently fanning out rows because room_category wasn't included in the join — the fix was adding the third composite-key column. State the symptom, how you traced it, and the fix.", signal: "The single most common project follow-up after 'explain your project.'" },
  { cat: "SQL", q: "Write a query to find duplicate rows in fact_aggregated_bookings.", a: "The table has no single-column primary key. Its grain is the composite (property_id, check_in_date, room_category). So the duplicate check is:<br><br><code>SELECT property_id, check_in_date, room_category, COUNT(*) AS cnt<br>FROM fact_aggregated_bookings<br>GROUP BY property_id, check_in_date, room_category<br>HAVING COUNT(*) > 1;</code><br><br>Any row returned is a true duplicate at the table's natural grain.", signal: "Tests: GROUP BY / HAVING on a composite grain, not just a single PK." },
  { cat: "SQL", q: "How would you calculate Occupancy % correctly in SQL?", a: "SELECT SUM(successful_bookings) * 100.0 / SUM(capacity) FROM fact_aggregated_bookings — both numerator and denominator come from the same table at the same grain, so no join is even required for the aggregate figure; a join to dim_hotels or dim_date is only needed if you want it sliced by property or date.", signal: "Tests recognizing that a KPI can sometimes be computed without any join at all, when both halves of the ratio live in the same table." },
  { cat: "SQL", q: "Write a query to build the vw_hotel_booking_analysis mart view for this project.", a: "SELECT fb.*, dh.property_name, dh.category, dh.city, dd.\"mmm yy\", dd.\"week no\", dd.day_type, dr.room_id, fab.successful_bookings, fab.capacity FROM fact_bookings fb LEFT JOIN dim_hotels dh ON fb.property_id=dh.property_id LEFT JOIN dim_date dd ON fb.check_in_date=dd.date LEFT JOIN dim_rooms dr ON fb.room_category=dr.room_class LEFT JOIN fact_aggregated_bookings fab ON fb.property_id=fab.property_id AND fb.check_in_date=fab.check_in_date AND fb.room_category=fab.room_category — this is the exact view specified in this project's Data Model.", signal: "Tests whether you can write the actual multi-table join with the correct composite join to fact_aggregated_bookings." },
  { cat: "SQL", q: "How would you implement the day_type business rule (Friday/Saturday = Weekend) in SQL?", a: "CASE WHEN DAYOFWEEK(date) IN (6,7) THEN 'Weekend' ELSE 'Weekday' END — but the exact day numbers depend entirely on your SQL dialect's week-start convention, so the safer pattern is CASE WHEN DAYNAME(date) IN ('Friday','Saturday') THEN 'Weekend' ELSE 'Weekday' END, which sidesteps the numbering ambiguity entirely.", signal: "Tests whether you catch that day-number conventions differ across SQL dialects — a real, easy-to-get-wrong translation of the DAX WEEKDAY() logic." },
  { cat: "SQL", q: "Why can't revenue_realized simply be summed the same way for every booking status?", a: "It already accounts for the difference — the metadata specifies that Cancelled bookings retain only 60% of revenue_generated (40% refunded), while Checked Out and No Show bookings keep 100%. That logic is baked into revenue_realized upstream, so summing it directly is correct; the trap is accidentally summing revenue_generated instead, which would overstate actual revenue by ignoring cancellation refunds entirely.", signal: "Tests whether you understand which of two similarly-named revenue columns to use, and why." },

  { cat: "SQL", q: "How would you correctly calculate room nights / length of stay from check_in and check_out dates?", a: "Room nights = DATEDIFF(day, check_in_date, checkout_date). Never use booking count when the stay can be longer than one night. In this dataset stay_duration is already provided, but if it were missing I would compute it with DATEDIFF and then guard against negative or zero values. ADR and many other metrics become wrong if you treat every booking as one room night.", signal: "Fundamental hospitality SQL skill — most juniors get this wrong." },
  { cat: "SQL", q: "Write a query for cancellation rate by booking_platform and city.", a: "<code>SELECT h.city, b.booking_platform,<br>&nbsp;&nbsp;COUNT(*) AS total_bookings,<br>&nbsp;&nbsp;SUM(CASE WHEN b.booking_status = 'Cancelled' THEN 1 ELSE 0 END) AS cancelled,<br>&nbsp;&nbsp;ROUND(100.0 * SUM(CASE WHEN b.booking_status = 'Cancelled' THEN 1 ELSE 0 END) / COUNT(*), 1) AS cancel_pct<br>FROM fact_bookings b<br>JOIN dim_hotels h ON b.property_id = h.property_id<br>GROUP BY h.city, b.booking_platform<br>ORDER BY cancel_pct DESC;</code><br>This is the exact view commercial teams use to decide which channels to tighten.", signal: "Practical multi-table aggregation + business framing." },
  { cat: "SQL", q: "How do you handle the fact that ratings_given is null on roughly 58% of rows?", a: "I treat it as expected, not broken — cancelled and no-show guests never left a rating, so those rows have nothing to report. In SQL, AVG(ratings_given) already ignores NULLs automatically, so a plain <code>SELECT AVG(ratings_given) FROM fact_bookings WHERE booking_status = 'Checked Out'</code> is correct as-is. The trap is using COALESCE(ratings_given, 0) or a similar fallback — that would silently drag the average down by treating \"never asked\" the same as \"rated zero.\"", signal: "Tests whether a candidate distinguishes an expected null from a data-quality defect, and knows AVG() already handles it correctly." },
  { cat: "SQL", q: "How would you QA / reconcile Occupancy % between fact_aggregated_bookings and the final dashboard?", a: "I run the same aggregation twice, from two different starting points, and expect them to match: <code>SELECT SUM(successful_bookings) * 100.0 / SUM(capacity) FROM fact_aggregated_bookings</code> against the dashboard's own Occupancy % visual with no filters applied. If they don't tie out, the usual causes are: the dashboard visual is implicitly filtered (e.g. only 'Checked Out' status, or a default date range), the DAX measure divides by a different denominator than SUM(capacity), or a broken composite join is fanning out rows. I reconcile at the whole-dataset level first, then narrow by property and month until I isolate exactly where the numbers diverge — never adjust the dashboard number to match without finding the actual cause.", signal: "Tests a real QA habit — reconciling from source, then narrowing — rather than assuming the dashboard is automatically correct." },
  { cat: "SQL", q: "Walk me through a booking lead-time analysis — what would you look for?", a: "Lead time = check_in_date − booking_date, bucketed into ranges like 0–3, 4–7, 8–14, 15–30 and 31+ days. I'd cross-tab those buckets against cancellation rate, ADR and channel — because short lead times (0–3 days) usually carry both higher cancellation risk and different pricing behaviour than bookings made a month out. I'd also break it out by city and by room class, since a luxury property's lead-time distribution can look very different from a business property's. The output is usually a simple recommendation: which lead-time bucket needs a tighter cancellation policy or a different rate strategy.", signal: "Tests whether the candidate can turn a single derived field (lead time) into a genuinely actionable segmentation, not just a chart." },

  // ---------------- Power BI & DAX ----------------
  { cat: "Power BI & DAX", q: "Walk me through building the Occupancy % measure in DAX, exactly as this project's metrics register defines it.", a: "Occupancy % = DIVIDE([Total Successful Bookings], [Total Capacity], 0) — where Total Successful Bookings = SUM(fact_aggregated_bookings[successful_bookings]) and Total Capacity = SUM(fact_aggregated_bookings[capacity]). Using DIVIDE with a 0 fallback avoids a divide-by-zero error when a filtered slice (e.g. one property, one day) has zero capacity rows.", signal: "Tests whether you know the exact DAX pattern from the project's own register, including the safe-division fallback." },
  { cat: "Power BI & DAX", q: "How would you build the Revenue WoW Change % measure, and why does it need variables?", a: "It needs the currently-selected week number (via SELECTEDVALUE or MAX on dim_date[wn]), then two CALCULATE() calls — one for the current week's Revenue, one for the prior week (wn − 1) using FILTER(ALL(dim_date), ...) to break out of the current filter context — then DIVIDE(current, prior) − 1. The variables exist because the 'prior week' calculation needs to reference the same selected week number the 'current week' calculation used, without recalculating it twice or having it drift.", signal: "Tests genuine DAX fluency — time intelligence via ALL()+FILTER() and variables, not just SUM()/COUNT()." },
  { cat: "Power BI & DAX", q: "Why is Realisation % defined as 1 − (Cancellation % + No Show Rate %) instead of directly as Checked Out ÷ Total Bookings?", a: "They're mathematically identical (since Checked Out + Cancelled + No Show = Total Bookings), but writing it as the complement makes the relationship between all three outcome rates explicit on the page — if a stakeholder asks 'why is Realisation only 70%,' the answer is visibly 'because Cancellation is 24.8% and No Show is 5.0%,' not just a standalone number they have to reverse-engineer.", signal: "Tests understanding of a deliberate formula-design choice, not just verifying the math checks out." },
  { cat: "Power BI & DAX", q: "How would you build the day_type calculated column in Power BI, matching this project's exact business rule?", a: "day_type = VAR wkd = WEEKDAY(dim_date[date], 1) RETURN IF(wkd > 5, \"Weekend\", \"Weekday\") — with WEEKDAY(date, 1) returning Sunday=1 through Saturday=7, so wkd > 5 catches exactly Friday (6) and Saturday (7), matching the stakeholder's non-calendar-standard weekend definition.", signal: "Tests whether you can reproduce a specific, non-obvious business rule in DAX exactly as specified, not just 'a weekend flag.'" },
  { cat: "Power BI & DAX", q: "Booking % by Room Class uses ALL(dim_rooms[room_class]) inside its DIVIDE(). What does ALL() do here, and why is it needed?", a: "ALL(dim_rooms[room_class]) removes any existing filter on room_class for that one calculation, so the denominator becomes 'total bookings across every room class' regardless of what the visual is currently filtered to — giving a true percent-of-total. Without ALL(), the denominator would silently match whatever room_class filter is already applied, making every row show 100%.", signal: "Tests understanding of filter context removal — a genuinely common DAX percent-of-total pattern." },

  { cat: "Power BI & DAX", q: "How would you implement Row Level Security so each hotel manager only sees their own property?", a: "Create a bridge table UserHotelAccess (UserEmail, property_id). In Power BI, create a role on DimHotels with the filter:<br><br><code>VAR CurrentUser = USERPRINCIPALNAME()<br>RETURN<br>CALCULATE(COUNTROWS(DimHotels),<br>&nbsp;&nbsp;FILTER(UserHotelAccess, UserHotelAccess[UserEmail] = CurrentUser)) &gt; 0</code><br><br>Test with 'View as' before every deployment. Regional managers get multiple rows; head office gets everything.", signal: "RLS is a very common interview topic for any multi-property dashboard." },
  { cat: "Power BI & DAX", q: "What is the difference between a calculated column and a measure? Give an example from this project.", a: "A calculated column is computed row-by-row at refresh time and stored in the model. A measure is calculated at query time in the current filter context.<br><br>Example: stay_duration can be a calculated column (it never changes). Occupancy %, ADR, RevPAR, Cancellation % must be measures — they have to respond to whatever city, date or room class the user filters. Putting RevPAR as a column would produce wrong numbers the moment any filter is applied.", signal: "Classic DAX conceptual question — almost every Power BI interview asks it." },
  { cat: "Power BI & DAX", q: "How would you create a dynamic title that shows the currently selected city and date range?", a: "Build a measure that reads the current filter context with SELECTEDVALUE() and falls back to a summary label when multiple values are selected, e.g. <code>Dynamic Title = \"Occupancy Dashboard — \" & SELECTEDVALUE(dim_hotels[city], \"All Cities\") & \" (\" & FORMAT(MIN(dim_date[date]), \"DD MMM\") & \" – \" & FORMAT(MAX(dim_date[date]), \"DD MMM\") & \")\"</code>. Then bind that measure to the visual title through Format pane → Title → Conditional formatting → Fields (or use a dedicated Card/Text visual above the page). It keeps every screenshot and export self-explanatory without a stakeholder needing to check the slicers.", signal: "Tests whether the candidate can turn slicer state into a readable page title, not just filter the visuals." },

  // ---------------- Tableau ----------------
  { cat: "Tableau", q: "How would you build the Weekday vs Weekend comparison view in Tableau?", a: "Put dim_date.day_type on Columns, SUM(revenue_realized) or COUNT(booking_id) on Rows, as a side-by-side bar chart — the day_type field itself needs to exist as a calculated field or a joined column from dim_date carrying the Friday/Saturday-as-weekend business rule, not Tableau's own DATENAME('weekday', ...) default.", signal: "Tests whether you'd import the project's specific day_type logic rather than relying on a generic weekday function." },
  { cat: "Tableau", q: "How would you build an Occupancy % KPI card with a week-over-week trend arrow in Tableau?", a: "A calculated field for current-week Occupancy %, a second LOD calculation ({FIXED [week no]: ...}) or table calculation (LOOKUP) to pull the prior week's value, then a third calculated field comparing the two to output a Unicode ▲/▼ — displayed alongside the raw percentage on a KPI-card-style worksheet.", signal: "Tests translating a DAX time-intelligence pattern into an equivalent Tableau LOD/table-calculation approach." },
  { cat: "Tableau", q: "Extract vs Live connection — which would you pick for this dashboard and why?", a: "A weekly-cadence hotel-group dashboard doesn't need real-time data, so a scheduled Extract (daily or weekly refresh) is the pragmatic choice over Live — it's faster for end users and puts less continuous load on the source database.", signal: "Tests connection-mode judgment tied to a realistic refresh cadence, not a default answer." },
  { cat: "Tableau", q: "How would you visualize Revenue by City and Category together without cluttering the dashboard?", a: "A grouped or stacked bar with City on one axis and hotel category (Luxury/Business) as the color/group dimension — or two separate, smaller bar charts side by side if the combination gets visually noisy. Given Luxury dominates overall revenue in this dataset ($1.05B vs $656M for Business), a stacked bar makes that imbalance immediately visible rather than burying it in two disconnected charts.", signal: "Tests dashboard design judgment tied to what the actual data shows." },

  // ---------------- Data Modeling ----------------
  { cat: "Data Modeling", q: "What's the grain of fact_aggregated_bookings, and why does it matter?", a: "One row per unique combination of property_id, check_in_date and room_category — not per booking, and not per hotel-day. Treating it as if it had a simpler grain (e.g. summing capacity without realizing multiple room types exist per property per day) would double-count or undercount capacity depending on which dimension gets dropped from a query.", signal: "Tests a genuine grain trap specific to this dataset's second fact table." },
  { cat: "Data Modeling", q: "Why does this model use two separate fact tables instead of one combined table with a capacity column added to every booking row?", a: "Capacity is a property/date/room-type-level attribute, not a per-booking attribute — a hotel's 30-room capacity for RT1 on a given day doesn't change based on how many individual bookings happened. Bolting it onto every fact_bookings row would mean repeating the same capacity value across dozens of booking rows, and updating it in dozens of places if it ever changed — classic denormalization risk that a separate, correctly-grained fact table avoids.", signal: "Tests understanding of why grain mismatches are a real modeling reason to split fact tables, not just a genericanswer about 'best practice.'" },
  { cat: "Data Modeling", q: "dim_rooms only has 4 rows. Is that too small to bother making it a separate dimension table?", a: "No — row count isn't what makes a dimension worth separating; the fact that room_category appears as a repeated, low-cardinality code (RT1–RT4) across 134,590+9,200 fact rows is exactly the textbook case for a dimension table, even a tiny one. It keeps the human-readable room_class label defined in exactly one place instead of repeated as a string on every fact row.", signal: "Tests understanding that dimension design is about cardinality and reuse, not the dimension table's own row count." },
  { cat: "Data Modeling", q: "How would you design a Date dimension for this model, and what's unusual about this one?", a: "A standard Date table spans the full period with derived Year/Month/Quarter/Week columns — here it's a genuinely short 92-day table (May–Jul only) since the source data doesn't span a full year, and it carries a business-specific day_type column (Friday/Saturday = Weekend) rather than the calendar-standard Saturday/Sunday split, which is the one thing you cannot get right by just importing a generic date dimension template.", signal: "Tests whether you'd notice a project-specific business rule instead of defaulting to generic date-dimension boilerplate." },

  // ---------------- Hospitality Domain ----------------
  { cat: "Hospitality Domain", q: "What's the difference between Occupancy % and Realisation %? They sound similar.", a: "They measure completely different things.<br><br>• Occupancy % = successful room nights ÷ available capacity → how full the hotel was.<br>• Realisation % = 1 − (Cancellation % + No-Show %) → what share of bookings actually turned into a stay.<br><br>You can have high occupancy and low realisation (heavy overbooking or late cancellations) or the opposite. Both belong on the dashboard because a GM needs both the capacity story and the demand-quality story.", signal: "Catches candidates who treat the two metrics as interchangeable." },
  { cat: "Hospitality Domain", q: "Why does ADR use Total Bookings as its denominator, but RevPAR uses Total Capacity?", a: "They answer different questions. ADR asks 'how much did we charge for the rooms we actually sold?' so the clean denominator is sold room nights. RevPAR asks 'how much revenue did every available room generate, sold or not?' so the denominator is total capacity.<br><br>In this project the metrics register defines ADR as Revenue ÷ Total Bookings — that is a simplification. Industry standard (STR, most hotel groups) uses Revenue ÷ Room Nights. Because many bookings have stay_duration > 1, using booking count understates true ADR. In an interview I always state which definition the dashboard is using so the GM does not compare our number to external industry reports.", signal: "Tests whether the candidate knows the industry definition vs the project's simplified version and can explain the difference cleanly." },
  { cat: "Hospitality Domain", q: "Why did the stakeholder define 'weekend' as Friday and Saturday instead of the calendar-standard Saturday and Sunday?", a: "It reflects actual guest behavior for this hotel group's likely customer mix — business and leisure travelers checking in Friday for a weekend stay, checking out Saturday or Sunday — meaning Friday night demand and pricing behaves like a weekend, not a weekday, even though the calendar says otherwise. This is exactly why the BRD calls for KPIs to be defined 'based on feedback from stakeholder' rather than a generic textbook rule — the business context determines the definition, not a convention.", signal: "Tests whether you understand KPI definitions are business decisions, not universal constants." },
  { cat: "Hospitality Domain", q: "The dataset shows 'others' as the single largest booking platform (55,066 of 134,590 bookings) — bigger than any named OTA. What would you do with that finding?", a: "Flag it as a data-quality gap before treating it as an insight — an unnamed 'others' bucket that large (41% of all bookings) likely means the platform-tracking logic isn't capturing every channel correctly, or several smaller platforms are being lumped together. The right next step is asking the source system owner what's actually inside 'others' before making any channel-strategy recommendation based on it.", signal: "Tests whether you scrutinize a suspiciously large catch-all category instead of reporting it at face value." },
  { cat: "Hospitality Domain", q: "How would you explain RevPAR to a hotel GM who's never seen a BI dashboard?", a: "It's the single number that answers 'how much money is each room in my hotel actually making me, on average, whether it's occupied tonight or not.' Unlike ADR, which only counts rooms that sold, RevPAR punishes empty rooms — so a hotel with high prices but low occupancy can have a worse RevPAR than a hotel with slightly lower prices but consistently full rooms, which is exactly the tradeoff a GM needs visibility into.", signal: "Tests translating a formula into a plain-English business implication a non-technical GM would actually act on." },

  // ---------------- Scenario-Based ----------------
  { cat: "Scenario-Based", q: "The GM of Shodwe Grands Delhi calls you at 9 AM. \"Occupancy last week was 92% but my revenue is lower than the week when occupancy was only 78%. Explain this to me in simple terms and show me the numbers.\"", a: "I would not jump into a dashboard. First I confirm the exact date ranges. Then I pull:<br>• ADR for both weeks (almost certainly ADR dropped sharply)<br>• Room-class mix – more Standard (RT1) and fewer Premium/Presidential?<br>• Channel mix – higher share of OTA or discounted corporate rates?<br>• Discount_applied average and distribution<br>Then I show a simple comparison table: Occupancy | ADR | RevPAR | Revenue | % OTA | Avg Discount. Most of the time the story is \"we bought occupancy with rate\". I end with one clear recommendation (e.g. protect rate on weekends or tighten discount rules for certain channels).", signal: "Tests whether you diagnose with data before opening your mouth, and whether you land on ADR/discounting as the likely cause rather than guessing." },
  { cat: "Scenario-Based", q: "Sudden spike in cancellations. Cancellation rate jumped from 18% to 31% in the last 10 days across Mumbai properties. Commercial team is panicking. What is your first 60-minute investigation plan?", a: "1. Confirm it is real (not a data issue) – compare vs aggregated file and previous weeks.<br>2. Slice by: property, room_category, booking_platform, booking_channel, lead_time bucket, country, loyalty flag.<br>3. Check cancellation_reason distribution – \"Found better deal\" vs \"Travel restrictions\" vs \"Change of plans\".<br>4. Look at booking window – are last-minute bookings (0–3 days) driving the spike?<br>5. Check if one OTA or one rate code is responsible for most of the increase.<br>Within 60 minutes I should be able to say: \"80% of the extra cancellations are coming from OTA + lead time &lt; 5 days on Standard rooms in two specific properties.\" Then commercial can act.", signal: "Tests structured triage under time pressure — confirm, slice, isolate the driver — rather than a vague \"I'd look into it.\"" },
  { cat: "Scenario-Based", q: "New competitor opened nearby. A new luxury hotel opened 2 km from Shodwe Exotica Mumbai three weeks ago. You are asked to quantify the impact so far and recommend pricing/action.", a: "• Compare the 3 weeks after opening vs the same 3 weeks before (and vs same period last year if available).<br>• Metrics: Occupancy, ADR, RevPAR, Booking volume, Lead time, Ratings, Cancellation rate – for Exotica and for other Mumbai luxury properties as control group.<br>• Segment: weekend vs weekday, room class, channel.<br>• If ADR and occupancy both soft only at Exotica while other Mumbai luxury hotels are stable → competitor impact is likely.<br>• Recommendation examples: targeted rate fence on weekdays, package with breakfast, loyalty push, or monitor for another 2 weeks before reacting.", signal: "Tests whether you know to build a control group before attributing a metric change to a single cause." },
  { cat: "Scenario-Based", q: "Revenue Manager wants a \"pace\" report. \"I need to know how next month is shaping up compared to how we were doing at the same point last year. Can you build me a booking pace view?\"", a: "Classic hospitality request. Even with limited history you explain the concept:<br>• On-the-books (OTB) revenue and room nights for future stay dates as of today.<br>• Compare with the OTB that existed on the same calendar day last year for the same future stay dates.<br>• Show by property, by week, by room class.<br>• Add pickup (how much was booked in the last 7 days) so they see momentum.<br>In Power BI this is usually two measures + a line chart with stay date on axis and a slicer for \"as-of\" date. In SQL you need a snapshot table or carefully reconstruct from booking_date.", signal: "Tests whether you know booking pace is a genuinely different concept from a simple period-over-period revenue comparison." },
  { cat: "Scenario-Based", q: "Data discrepancy between two systems. The PMS shows 1,240 room nights sold last week. Your Power BI dashboard shows 1,187. Finance is using your number for the flash report. What do you do?", a: "1. Stay calm and treat it as a data-quality incident, not a fight.<br>2. Immediately reconcile at the lowest grain: property × date × room_category.<br>3. Common causes in hospitality: status mapping (No-Show counted differently), day-use rooms, complementary rooms, timezone/date boundary issues, or late modifications that missed the extract.<br>4. Produce a clear variance table and root-cause note within a few hours.<br>5. Agree with Finance which number is \"official\" for the flash and fix the pipeline so it does not happen again.<br>Never hide the difference or force the numbers to match without understanding why.", signal: "Tests composure and rigor under a real discrepancy, and whether you'd ever paper over a mismatch instead of explaining it." },
  { cat: "Scenario-Based", q: "Leadership wants one number – \"Which is our best hotel?\" CEO asks in a meeting: \"Just tell me which hotel is performing best right now.\" How do you answer without being misleading?", a: "I refuse to give a single ranking without context. I say: \"Best depends on the lens. On pure RevPAR it is X. On occupancy it is Y. On growth vs last month it is Z. On guest rating it is W. If I have to pick one primary metric for overall health I use RevPAR, but I always show the top 3 with the other KPIs beside them.\"<br>Then I put a small ranked table on screen with Occupancy, ADR, RevPAR, Cancellation %, Avg Rating. This protects you from being quoted with a one-dimensional answer later.", signal: "Tests whether you resist collapsing a genuinely multi-metric question into a single misleading number just because leadership wants a quick answer." },
  { cat: "Scenario-Based", q: "Loyalty members vs non-members. Marketing wants to know if loyalty members are actually more valuable. They only look at number of bookings. What analysis do you run?", a: "Compare is_loyalty_member = true vs false on:<br>• ADR and RevPAR contribution<br>• Average LOS<br>• Cancellation and No-show rate<br>• Repeat frequency (bookings per customer)<br>• Channel mix (do they book direct more often?)<br>• Ratings given<br>• Discount_applied (are we giving away too much to members?)<br>Often loyalty members have higher LOS and lower cancellation but sometimes lower ADR because of member rates. Net value is what matters, not just booking count.", signal: "Tests whether you catch that the stakeholder's chosen metric (booking count) doesn't actually answer their question (value)." },
  { cat: "Scenario-Based", q: "Weekend vs Weekday strategy question. Revenue Manager says: \"Weekends are full but weekdays are weak in Bangalore. Should we drop weekday rates aggressively?\"", a: "I pull weekday vs weekend for Bangalore properties: Occupancy, ADR, RevPAR, Lead time, Channel mix, Room class mix, Cancellation rate.<br>Then I check:<br>• How much of weekday demand is corporate / long-stay vs leisure?<br>• What is the current booking pace for next 4–6 weeks on weekdays?<br>• Elasticity – when we dropped rates in the past, how much extra occupancy did we actually gain?<br>Blindly dropping rate can train the market to wait for discounts. Better options often include: corporate rate review, longer-stay discounts, package with meeting room/F&B, or targeted promotions only on specific soft dates.", signal: "Tests whether you push back on a reflexive \"just lower the price\" instinct with actual elasticity evidence." },
  { cat: "Scenario-Based", q: "You have only 2 hours before a big meeting. Regional Director wants a one-page view of all 25 Shodwe properties for the last 30 days by 11 AM. It is currently 9 AM. What do you deliver?", a: "I do not try to build a perfect dashboard. I deliver a clean one-pager (Excel or Power BI screenshot) with:<br>• KPI cards: Total Revenue, Occupancy, ADR, RevPAR, Cancellation % (vs previous 30 days)<br>• Ranked table of 25 properties: Property | City | Category | Occ % | ADR | RevPAR | Cancel % | Rating<br>• Two small charts: Revenue by City, Occupancy trend last 4 weeks<br>• One insight call-out (e.g. \"Hyderabad Luxury properties showing 12% RevPAR soft – mainly ADR driven\")<br>Speed + clarity beats perfection when the clock is running.", signal: "Tests judgment under a hard deadline — knowing what to cut and still deliver something decision-useful." },
  { cat: "Scenario-Based", q: "Suspected data leak / wrong discount. You notice several Presidential room bookings (RT4) with extremely high discount_applied and very low revenue_realized. What do you do?", a: "1. Flag the rows immediately and quantify the revenue leakage.<br>2. Check whether they share the same booking_platform, agent, or customer_id pattern.<br>3. Verify if the discount is within approved limits or if rate-code mapping is broken.<br>4. Escalate to Revenue Manager / Finance with the list of booking_ids – do not try to \"fix\" the numbers yourself.<br>5. Add a data-quality rule going forward: alert when discount on RT4 exceeds X% or ADR falls below a floor.<br>This is both an analytics and a control issue.", signal: "Tests whether you treat a suspicious pattern as an escalation, not something to quietly correct yourself." },

  { cat: "Scenario-Based", q: "A hotel is running 95% occupancy but departmental profit (GOP) is down. What do you look at first?", a: "High occupancy with falling profit almost always means we bought the occupancy with rate or with expensive channels. I immediately check: 1) ADR trend, 2) Channel mix and commission cost, 3) Room-class mix (more Standard, fewer Premium), 4) Discount depth, 5) Cost per occupied room if cost data exists. Then I build a simple waterfall: Gross Revenue → Commission → Net Revenue → Departmental Profit so the GM sees exactly where the money disappeared.", signal: "Tests commercial thinking, not just KPI knowledge." },
  { cat: "Scenario-Based", q: "How would you measure the impact of a 3% increase in OTA commission?", a: "Before-vs-after analysis (8–12 weeks each side). Calculate Net Revenue = revenue_realized × (1 – commission%). Also track volume (did the OTA send more bookings after the change?) and ADR. Most of the time the extra volume does not offset the higher commission. I present a waterfall so the commercial team can see the net impact in one view.", signal: "Directly relevant to revenue management decisions." },
  { cat: "Scenario-Based", q: "Guest ratings dropped in one city — how do you investigate whether it's a data issue or a real service problem?", a: "First I check the data itself: has the volume of ratings collected also dropped (a smaller, noisier sample can swing an average without anything changing operationally), did a new property or room class open in that city and skew the mix, and did the survey or collection method change around the same date. Only once the numbers are confirmed clean do I treat it as real — then I'd slice by property, room class and stay length to see if the drop is concentrated (one property, one team) or spread across the whole city, and cross-check against cancellation and complaint volume for the same period before escalating to Ops.", signal: "Tests whether you verify data integrity before jumping to a service-quality conclusion." },

  // ---------------- General & HR ----------------
  { cat: "General & HR", q: "What was your biggest challenge on this project, and how did you solve it?", a: "Pick something concrete — e.g. discovering the composite join key between fact_bookings and fact_aggregated_bookings needed all three columns (property_id, check_in_date, room_category), not just two, and how a partial join was silently inflating Occupancy % before you caught it. Say what broke, how you diagnosed it, and what you changed.", signal: "Tests whether your challenge story is specific enough to be believable." },
  { cat: "General & HR", q: "Describe your process when you're handed a metrics register with 25 DAX formulas before you've seen the data.", a: "Read the formulas against the actual column names first — confirm every table and column a formula references genuinely exists in the source files (this project's fact_bookings has 10 columns beyond what the metadata documents, which is exactly the kind of mismatch worth catching early) — before building a single visual. Building against an unverified formula wastes far more time than the verification itself.", signal: "Tests a concrete process discipline this specific project (metrics register handed over separately from the data) is well suited to test." },
  { cat: "General & HR", q: "How do you handle a KPI that seems to contradict another KPI on the same dashboard?", a: "Check the definitions before assuming either number is wrong — e.g. Occupancy % (57.9%) and Realisation % (70.2%) look inconsistent at a glance, but they measure genuinely different things (capacity utilization vs. booking-to-stay conversion), so there's no actual contradiction once you understand what each one is scoped to.", signal: "Tests whether you default to trusting your formulas over your gut reaction to two numbers that 'look wrong together.'" },
  { cat: "General & HR", q: "Tell me about a time you found an error in your own analysis.", a: "A strong answer names the specific check that caught it — e.g. a QA reconciliation query showing SQL's Occupancy % didn't match the dashboard until you realized the dashboard visual was implicitly filtering to Checked Out bookings only, while your SQL summed all fact_aggregated_bookings rows regardless of status. Owning the mistake and describing the fix matters more than the mistake itself.", signal: "Tests accountability and self-QA habits." },
  { cat: "General & HR", q: "How would you explain this dashboard to a hotel GM who's never used a BI tool?", a: "Lead with the business question: 'It shows exactly how full your hotel is right now, how much you're charging per room, and how many bookings you're losing to cancellations — the same numbers you used to wait for a manual Excel report to see, but always current.' Save 'DAX measure, mart view, live connection' for if they ask how it's built.", signal: "One of the most common on-the-spot tests in BA/Analyst interviews." },

  // ---------------- Rapid Fire ----------------
  { cat: "Rapid Fire", q: "ADR vs RevPAR — one-line difference?", a: "ADR is revenue ÷ rooms sold; RevPAR is revenue ÷ rooms available (sold or not) — RevPAR is always ≤ ADR.", signal: "Rapid-fire hospitality-domain screening question." },
  { cat: "Rapid Fire", q: "What is DIVIDE() in DAX and why use it over the / operator?", a: "DIVIDE() safely returns a specified fallback (often 0 or BLANK) on division by zero, instead of throwing an error — critical for ratio KPIs like Occupancy % or ADR when a filtered slice has zero rows.", signal: "Rapid-fire DAX screening question." },
  { cat: "Rapid Fire", q: "What does 'No Show' mean in this dataset, as opposed to 'Cancelled'?", a: "Cancelled means the guest actively cancelled before check-in; No Show means the guest neither cancelled nor showed up — the booking was simply never fulfilled, with no advance warning to the hotel.", signal: "Rapid-fire domain-terminology screening question." },
  { cat: "Rapid Fire", q: "Live connection vs Extract — one-line difference?", a: "Live sends queries to the source database in real time on every interaction; an Extract snapshots data into the BI tool's own fast in-memory format on a schedule.", signal: "Rapid-fire connection-mode screening question." },
  { cat: "Rapid Fire", q: "Which DAX function have you used the most, and in what context?", a: "Have a real, specific answer ready — e.g. 'DIVIDE() for every ratio KPI, and CALCULATE() with ALL() for percent-of-total measures like Booking % by Platform' — genuinely tied to this project rather than a generic list.", signal: "Interviewers use this to catch candidates who haven't actually written much DAX." },
];

const M_GLOSSARY = [
  { t: "ADR (Average Daily Rate)", d: "Revenue divided by rooms sold — the average amount paid per booked room." },
  { t: "RevPAR (Revenue Per Available Room)", d: "Revenue divided by total available rooms, occupied or not — always ≤ ADR." },
  { t: "Occupancy %", d: "Successful bookings divided by total available capacity — the core hospitality utilization metric." },
  { t: "Realisation %", d: "1 minus (Cancellation % + No Show Rate %) — the share of bookings that convert to a completed stay." },
  { t: "Cancellation %", d: "Cancelled bookings as a share of all bookings." },
  { t: "No Show Rate %", d: "Bookings where the guest neither cancelled nor arrived, as a share of all bookings." },
  { t: "DBRN (Daily Booked Room Nights)", d: "Average number of rooms booked per day over a period." },
  { t: "DSRN (Daily Sellable Room Nights)", d: "Average number of rooms available to sell per day over a period." },
  { t: "DURN (Daily Utilized Room Nights)", d: "Average number of rooms successfully checked-out (utilized) per day over a period." },
  { t: "Revenue generated vs. realized", d: "Revenue generated is the full booking value; revenue realized is what the hotel actually keeps after cancellation deductions." },
  { t: "Fact table", d: "A table containing measurable, numeric events (e.g. a booking) that dimensions describe." },
  { t: "Dimension table", d: "A descriptive table (dim_hotels, dim_rooms, dim_date) that a fact table joins to for context." },
  { t: "Grain", d: "The level of detail one row in a fact table represents — e.g. fact_aggregated_bookings' grain is one row per property × date × room type." },
  { t: "Composite key", d: "A key made of more than one column — fact_aggregated_bookings' grain (and join key back to fact_bookings) is a 3-column composite: property_id, check_in_date, room_category." },
  { t: "Mart view", d: "A SQL view that pre-joins dimension and fact tables into one business-ready table for BI consumption — vw_hotel_booking_analysis in this project." },
  { t: "WoW (Week-over-Week)", d: "A comparison of a metric's current-week value against its prior-week value — used for trend arrows on KPI cards." },
  { t: "DAX", d: "Data Analysis Expressions — the formula language used in Power BI for calculated columns and measures." },
  { t: "Measure (DAX)", d: "A calculation evaluated at query time in the current filter context — e.g. Occupancy %." },
  { t: "Calculated column", d: "A value computed row-by-row and stored in the model at refresh time — e.g. day_type." },
  { t: "CALCULATE()", d: "The DAX function that modifies filter context — used to scope a measure to a specific condition, like booking_status = 'Cancelled'." },
  { t: "ALL()", d: "A DAX function that removes existing filters on a column or table — used to compute percent-of-total measures." },
  { t: "Primary key (PK)", d: "The column that uniquely identifies each row in a table." },
  { t: "Foreign key (FK)", d: "A column in one table that references a primary key in another, creating the relationship." },
  { t: "Referential integrity", d: "The guarantee that every foreign key value points to a real row in its parent table — no orphans." },
  { t: "KPI", d: "Key Performance Indicator — a quantifiable metric used to evaluate the success of an activity or objective." },
  { t: "P1 / P2 priority", d: "A tagging convention for ranking which KPIs matter most to build first (P1) versus which are secondary (P2)." },
];

/* ---------------- STUDENT TIPS ---------------- */
const M_TIPS = [
  { n: "01", h: "Tell the project as a story, not a feature list", p: "Data source & scale → tools & technique → the challenge you hit → the business outcome, in that order. Interviewers remember stories; they don't remember tool lists." },
  { n: "02", h: "Always use real numbers", p: "\"Large hotel dataset\" says nothing. \"134,590 bookings across 25 hotels in 4 cities, 57.9% occupancy, 24.8% cancellation rate\" says everything, and it's defensible if asked a follow-up." },
  { n: "03", h: "Know the 'why', not just the 'what'", p: "Anyone can say 'we calculated Occupancy %.' Fewer people can explain why ADR and RevPAR use different denominators, or why the weekend rule is Friday/Saturday instead of the calendar default. The 'why' is what gets tested in follow-ups." },
  { n: "04", h: "Different rounds test different depth", p: "An L1 screen often checks fundamentals (joins, GROUP BY, DIVIDE vs /). An L2 round goes architectural (why two fact tables, composite keys, time-intelligence DAX). Prep both levels." },
  { n: "05", h: "Lead metrics with the business question they answer", p: "For a GM, \"RevPAR tells you how much every room makes you, occupied or not\" beats \"here's a bar chart of revenue.\" Practice restating every KPI as a plain-English business question first." },
  { n: "06", h: "Have one specific, honest challenge story ready", p: "Vague answers like \"the data was messy\" read as rehearsed. A specific fix — like catching that fact_aggregated_bookings needed a 3-column composite join, not 2 — reads as real experience." },
  { n: "07", h: "Contribute across every tool, not just your favorite", p: "This capstone is graded on Excel, SQL, Tableau, Power BI and QA together. In interviews, breadth across the stack signals you can work wherever a team needs you." },
  { n: "08", h: "Practice explaining a dashboard to a non-technical stakeholder", p: "Being asked to \"explain this to someone who's never seen a BI tool\" is one of the most common on-the-spot tests — rehearse it out loud before the interview." },
  { n: "09", h: "Structure every scenario answer the same way", p: "When a stakeholder hands you a messy problem (a GM's revenue question, a spike in cancellations, a data mismatch), structure your answer as: Clarify the exact scope → Diagnose with data → Quantify the impact → Recommend one clear next step. Interviewers are grading the structure as much as the content." },
];

const M_TIP_CALLOUT = "Cracking a data analyst or BI interview isn't about reciting definitions — it's about showing how you think, communicate, and handle messiness: two fact tables at different grains, a formula with a hidden business rule (Friday counts as weekend), a stakeholder who wants the occupancy number yesterday. Every question in the Interview Prep tab is really testing one of those things.";

/* ---------------- KEY INSIGHTS & RECOMMENDATIONS ---------------- */
const M_KEY_INSIGHTS = [
  { insight: "Cancellation % sits at 24.8%, plus a further 5.0% No Show — nearly 3 in 10 bookings never actually check out, and Realisation % (Checked Out ÷ Total) is only 70.2%.", recommendation: "Report 'realized' revenue on Checked-Out bookings only (already done here), but also track a separate 'at-risk pipeline' figure from confirmed-not-yet-arrived bookings, so leadership sees exposure before it becomes a cancellation." },
  { insight: "The 'others' booking-platform category is the single largest channel at 55,066 bookings — 41% of all bookings, larger than the top 4 named platforms (makeyourtrip, logtrip, direct online, tripster) combined.", recommendation: "Push back on the source system to name what's actually inside 'others' before building a channel-investment dashboard — an unlabeled catch-all this large will mislead any decision built on top of it." },
  { insight: "Business-category hotels generate more average revenue per property (~$72.9M) than Luxury hotels (~$65.8M), despite Luxury having nearly double the property count (16 vs 9).", recommendation: "Don't assume the 'Luxury' label means better commercial performance — investigate whether Business hotels benefit from location, occupancy, or booking mix before reallocating investment based on category name alone." },
  { insight: "Average Rating is populated for only about 42% of bookings (56,683 of 134,590) — guests who cancelled or no-showed never left one.", recommendation: "Never compute Average Rating over all rows; confirm it explicitly filters to completed stays, and report response rate alongside the score itself so a high average isn't mistaken for broad feedback coverage." },
  { insight: "Mumbai alone accounts for roughly 39% of the revenue shown across the 4 named cities ($668.6M of about $1.7B).", recommendation: "Flag Mumbai's revenue concentration to leadership as a standing risk item — a single city driving that much of group revenue deserves its own contingency plan, not just a line on a city-comparison chart." },
  { insight: "day_type is calculated with a stakeholder-specific rule — Friday and Saturday count as 'Weekend,' not the calendar-standard Saturday/Sunday.", recommendation: "Always confirm a business rule like this in writing before encoding it — assuming the calendar-standard weekend instead of asking silently breaks every Weekday vs Weekend KPI on both dashboards." }
];

/* ---------------- RESUME BULLET POINTS ---------------- */
const M_RESUME_BULLETS = [
  "Built an interactive Booking & Occupancy dashboard analyzing 134,590 hotel bookings across 25 properties and 4 cities, calculating Occupancy %, ADR and RevPAR reconciled to SQL within ±0.1%.",
  "Uncovered that an unlabeled 'others' booking-channel category represented 41% of all bookings — larger than the top 4 named platforms combined — flagging a data-governance gap before it could mislead a channel-investment decision.",
  "Modeled a two-fact-table hospitality schema (individual bookings vs. pre-aggregated occupancy, different grains) joined via a composite key, and reconciled 26 KPIs across SQL, Power BI and Tableau."
];

/* ---------------- 2-MINUTE ELEVATOR PITCH ---------------- */
const M_ELEVATOR_PITCH = "I built an end-to-end hospitality analytics project using a real hotel booking dataset — about 134,590 bookings across 25 properties in 4 cities over three months. The data had two fact tables at different grains — individual bookings, and a separate pre-aggregated occupancy table — joined through a composite key on property, date and room type, which took real modeling judgment to get right. I built a Booking & Occupancy dashboard in both Power BI and Tableau covering Revenue, Occupancy %, ADR and RevPAR, plus a weekday-versus-weekend comparison using a stakeholder-specific rule where Friday counts as a weekend day, not the calendar standard. The most interesting finding was a data-governance issue: an unlabeled 'others' category was actually the single largest booking channel, ahead of every named platform combined — which meant any channel-performance conclusion built on the named platforms alone would have been misleading. I reconciled all 26 KPIs between SQL and both BI tools to within a tenth of a percent before calling it done.";

/* ---------------- PROJECT-SPECIFIC FAQ ---------------- */
const M_PROJECT_FAQ = [
  { q: "What if the interviewer isn't technical — how much detail should I give?", a: "Lead with the business framing (a hotel group with no unified view of occupancy or revenue across properties) and the outcome (two dashboards, a real channel-labeling issue you caught), and only go into SQL/DAX/Tableau specifics if they ask a follow-up." },
  { q: "What if I only worked on one part of this project (e.g. just Power BI, not the SQL)?", a: "Say so plainly and describe your part in depth — a specific, detailed answer about the piece you actually own is far stronger than a vague answer implying you did all of it." },
  { q: "What if they ask why you chose a hospitality dataset specifically?", a: "A good honest answer: it forces you to deal with a genuine two-grain data model (bookings vs. pre-aggregated occupancy) and a business-specific rule (Friday as weekend) — a better test of real modeling judgment than a single flat fact table." },
  { q: "What if they ask what you'd do differently with more time?", a: "Have one real answer ready — e.g. the 'others' booking-platform category hides real channel names; a real next step would be going back to the source system to properly categorize it before trusting any channel-mix conclusion." },
  { q: "What if they push on why you used two BI tools instead of just one?", a: "This capstone specifically requires KPI parity across both Power BI and Tableau as a reconciliation exercise — say that directly, and note that in a real job you'd typically pick one tool per organization." },
  { q: "What if you freeze or forget a specific number mid-answer?", a: "Say what you do remember directionally (\"cancellation rate is roughly 1 in 4 bookings, a meaningfully large share\") rather than guessing a fake precise number — a confident approximate answer reads better than a wrong exact one." }
];

/* ---------------- LEARN MORE / EXTERNAL LINKS ---------------- */
const M_LEARNING_LINKS = [
  { title: "RevPAR vs. ADR, Explained", desc: "A plain-English breakdown of the core hotel revenue-management metrics this project's KPIs are built on — read this before the KPI List tab if the formulas feel unfamiliar.", url: "https://www.smartorder.ai/blog/what-is-the-difference-between-adr-and-revpar", source: "SmartOrder" },
  { title: "Tableau — Free Training Videos", desc: "Tableau's own on-demand video library, organized into beginner-friendly learning paths — connecting to data, building your first viz, and dashboards.", url: "https://www.tableau.com/learn/training", source: "Tableau" },
  { title: "Tableau Public Gallery", desc: "Browse real, published dashboards for design and layout inspiration before you build your own Booking & Occupancy dashboard.", url: "https://public.tableau.com/en-us/s/", source: "Tableau" },
  { title: "Power BI Learning Paths (Microsoft Learn)", desc: "Microsoft's free, structured, hands-on modules for Power BI — data modeling, DAX measures, and report building, with in-browser labs.", url: "https://learn.microsoft.com/en-us/training/powerplatform/power-bi", source: "Microsoft" },
  { title: "Star Schema Design Guidance", desc: "Official Power BI documentation on star-schema modeling — useful for understanding why this project's two fact tables at different grains still join through one clean model.", url: "https://learn.microsoft.com/en-us/power-bi/guidance/star-schema", source: "Microsoft" },
  { title: "MySQL Official Documentation", desc: "The official MySQL manual — installation, SQL statements, and administration, straight from Oracle/MySQL.", url: "https://dev.mysql.com/doc/", source: "MySQL" },
  { title: "Free SQL Tutorial — Joins & Aggregations (Mode)", desc: "A free, interactive SQL tutorial covering exactly the joins and GROUP BY logic this project's composite-key join and QA queries depend on.", url: "https://mode.com/sql-tutorial/", source: "Mode Analytics" },
  { title: "Excel Training (Microsoft Learn catalog)", desc: "Microsoft's own free Excel training catalog — pivot tables and data prep, the Stage 1 tool in this project's workflow.", url: "https://learn.microsoft.com/en-us/training/browse/?products=excel", source: "Microsoft" }
];

/* ============================================================
   Chart helpers (native SVG — no external images, no dependencies)
   ============================================================ */

const M_WEAK_STRONG = [
  {
    q: "What is RevPAR?",
    weak: "RevPAR is revenue per available room. It's revenue divided by the number of rooms.",
    strong: "RevPAR (Revenue Per Available Room) is revenue divided by total available rooms — occupied or not — which is why it's always ≤ ADR. It answers a different question than ADR: not \"how much did we charge for rooms we sold,\" but \"how much did every room in the building earn us, whether it sold or sat empty.\" A hotel with high rates but low occupancy can lose to a hotel with lower rates but full rooms once you look at RevPAR instead of ADR alone.",
  },
  {
    q: "Why does ADR use Total Bookings as its denominator, but RevPAR uses Total Capacity?",
    weak: "ADR is revenue divided by bookings and RevPAR is revenue divided by capacity, so they're just different formulas.",
    strong: "They answer different questions. ADR asks 'how much did we charge for the rooms we actually sold?' so the clean denominator is sold room nights. RevPAR asks 'how much revenue did every available room generate, sold or not?' so the denominator is total capacity. In this project the metrics register defines ADR as Revenue ÷ Total Bookings — that's a simplification; the industry standard is Revenue ÷ Room Nights. I'd always state which definition the dashboard is using so the GM isn't comparing our number to an external STR report on a different basis.",
  },
  {
    q: "How did you connect SQL to Tableau and Power BI in this project?",
    weak: "I just added a new data source in each tool, typed in the server details, and connected to the database.",
    strong: "We never pointed Tableau or Power BI at the raw Excel files. The five source tables were loaded into MySQL, cleaned, and exposed through a single governed mart view — vw_hotel_booking_analysis. Both BI tools connect only to that view. This gives one source of truth and makes QA simple: the same SQL that feeds the dashboard is what we run to reconcile every number, instead of two tools potentially drifting from two separate data pulls.",
  },
];

/* ============================================================
   ShodweStay Hospitality Analytics — Capstone, Practice & Interview Prep Hub
   Numbers come from hosp-data.js (window.HOSP). Original project
   content lives in 00-orig.js (M_ constants).
   ============================================================ */
const HOSP = window.HOSP || {};
const A = HOSP.A || {};
const MD = HOSP.M || {};
const fmtN = (n) => Number(n).toLocaleString("en-IN");
const fmtUS = (n) => Number(n).toLocaleString("en-US");
const f1 = (n) => (Math.round(n * 10) / 10).toFixed(1);
const f2 = (n) => Number(n).toFixed(2);
const usdM = (n) => "$" + (Number(n) / 1e6).toFixed(1) + "M";
const CERTIVA_URL = "https://www.certiva.co.in/";
const CRACKANALYTICS_URL = M_CRACKANALYTICS_URL;

/* ---------------- KPIs (original 26-measure register) ---------------- */
const KPI_Q = {
  "Revenue": "How much money did we actually keep from bookings?",
  "ADR (Average Daily Rate)": "What do we earn on an average booking?",
  "RevPAR (Revenue Per Available Room)": "How much does every available room earn, sold or not?",
  "Realisation %": "What share of bookings actually turn into a stay?",
  "Total Bookings": "How many bookings did we take?",
  "Total Checked Out": "How many guests actually stayed?",
  "Total Cancelled Bookings": "How many bookings were cancelled?",
  "Cancellation %": "What share of bookings do we lose to cancellation?",
  "Total No Show Bookings": "How many guests never turned up?",
  "No Show Rate %": "What share of bookings are no-shows?",
  "Average Rating": "How happy are guests who rated us?",
  "Total Capacity": "How many room-nights could we have sold?",
  "Total Successful Bookings": "How many room-nights were booked against capacity?",
  "Occupancy %": "How full are our hotels?",
  "No of Days": "How many days does the selected period cover?",
  "DBRN (Daily Booked Room Nights)": "How many rooms are booked per day?",
  "DSRN (Daily Sellable Room Nights)": "How many rooms can we sell per day?",
  "DURN (Daily Utilized Room Nights)": "How many rooms are actually used per day?",
  "Booking % by Platform": "Which channels bring our bookings?",
  "Booking % by Room Class": "Which room classes do guests book?",
};
const KPI_V = {
  "Revenue": "$" + fmtUS(A.rev) + " (≈ $1.71B)", "ADR (Average Daily Rate)": "$" + fmtUS(Math.round(A.adr)), "RevPAR (Revenue Per Available Room)": "$" + fmtUS(A.revpar),
  "Realisation %": f1(A.real_pct) + "%", "Total Bookings": fmtUS(A.bookings), "Total Checked Out": fmtUS(A.checked_out), "Total Cancelled Bookings": fmtUS(A.cancelled),
  "Cancellation %": f1(A.cancel_pct) + "%", "Total No Show Bookings": fmtUS(A.no_show), "No Show Rate %": f1(A.noshow_pct) + "%", "Average Rating": A.avg_rating + " / 5 (56,683 rated stays)",
  "Total Capacity": "≈ 232.6K room-nights (DSRN 2,528 × 92 days)", "Total Successful Bookings": fmtUS(A.bookings), "Occupancy %": f1(A.occ) + "%", "No of Days": "92",
  "DBRN (Daily Booked Room Nights)": fmtUS(A.dbrn), "DSRN (Daily Sellable Room Nights)": fmtUS(A.dsrn), "DURN (Daily Utilized Room Nights)": fmtUS(A.durn),
  "Booking % by Platform": "others 40.9% · makeyourtrip 20.0%", "Booking % by Room Class": "Elite 36.8% · Standard 28.6%",
};
const KPI_WRONG = {
  "Revenue": "Higher if you SUM revenue_generated: cancelled bookings keep only 60% of it",
  "Average Rating": "≈1.52 if blank ratings are treated as 0",
  "Occupancy %": "Wrong if capacity comes from a booking-level join (capacity repeats on every booking row)",
  "RevPAR (Revenue Per Available Room)": "Inflated if capacity is summed after joining to fact_bookings",
  "Booking % by Platform": "100% on every row if ALL() is missing from the denominator",
  "Booking % by Room Class": "100% on every row if ALL() is missing from the denominator",
  "ADR (Average Daily Rate)": "Industry ADR divides by room nights (stay_duration), not bookings: know which one the register asks for",
};
const KPI_TIER = {
  "Revenue": "P1", "ADR (Average Daily Rate)": "P1", "RevPAR (Revenue Per Available Room)": "P1", "Occupancy %": "P1", "Total Bookings": "P1", "Cancellation %": "P1", "Realisation %": "P1", "Average Rating": "P1",
  "Total Checked Out": "P2", "Total Cancelled Bookings": "P2", "Total No Show Bookings": "P2", "No Show Rate %": "P2", "Total Capacity": "P2", "Total Successful Bookings": "P2", "Booking % by Platform": "P2", "Booking % by Room Class": "P2",
};
const KPIS = M_KPIS.map((k, i) => ({
  id: "k" + (i + 1), name: k.name, cat: k.cat, q: KPI_Q[k.name] || (k.name.includes("WoW") ? "Is this KPI improving week over week?" : k.desc), desc: k.desc,
  plain: k.definition || k.desc, formula: k.formula, dax: k.name + " = " + k.formula, table: k.table,
  v25: KPI_V[k.name] || (k.name.includes("WoW") ? "Depends on the selected week (use the wn column)" : "—"), wrong: KPI_WRONG[k.name] || "", prio: KPI_TIER[k.name] || "P3",
  dir: /Cancel|No Show/.test(k.name) ? "lower is better" : "higher is better",
}));
const KPI_CATS = M_KPI_CATS;

/* ---------------- STATS ---------------- */
const STATS = [
  { num: fmtUS(A.bookings), lbl: "Bookings (May–Jul 2022)" },
  { num: "25", lbl: "Hotels · 4 cities" },
  { num: f1(A.occ) + "%", lbl: "Occupancy" },
  { num: "8 → 26", lbl: "Must-know P1 KPIs → full register" },
  { num: f1(A.cancel_pct) + "%", lbl: "Cancellation rate" },
];

/* ---------------- JOURNEY ---------------- */
const JOURNEY = [
  { id: "j1", t: "Understand the Business Problem", d: "Read the problem statement, the BRD requirements and the 8 business questions. Write down, in one line, what the revenue manager wants to decide.", go: "problem", track: "business" },
  { id: "j2", t: "Explore the Dataset", d: "Open all 5 tables. Note the two fact grains (booking vs property × date × room), the 92-day window and the Friday/Saturday weekend rule.", go: "dataset", track: "business" },
  { id: "j3", t: "Build the Data Model", d: "Load the 3 dimensions, then both facts. Relate each fact to dim_hotels, dim_date and dim_rooms; never join the two facts directly in Power BI.", go: "model", track: "model" },
  { id: "j4", t: "Clean & Validate the Data", d: "Run the data-quality checks: rating coverage, the 'others' platform, revenue_realized logic, composite-key duplicates. Document what's a defect and what's by design.", go: "quality", track: "model" },
  { id: "j5", t: "Write SQL Queries", d: "Load into MySQL, run the KPI queries and build the vw_hotel_booking_analysis mart view.", go: "sql", track: "sql" },
  { id: "j6", t: "Create KPIs", d: "Implement the 8 P1 KPIs first: Revenue, ADR, RevPAR, Occupancy %, Total Bookings, Cancellation %, Realisation %, Average Rating. Then the rest of the 26.", go: "kpis", track: "kpi" },
  { id: "j7", t: "Build the Tableau Dashboard", d: "Connect Tableau to MySQL and build the Booking & Occupancy dashboard pages.", go: "dashboards", track: "tableau" },
  { id: "j8", t: "Build the Power BI Dashboard", d: "Same pages in Power BI: DAX measures, a marked Date table with wn and day_type, and the WoW measures.", go: "dashboards", track: "powerbi" },
  { id: "j9", t: "Perform QA", d: "Reconcile every KPI between SQL, Tableau and Power BI within ±0.1. Fill in the reconciliation table and sign off the checklist.", go: "qa", track: "qa" },
  { id: "j10", t: "Present Your Business Insights", d: "Turn the numbers into 5 insights and 5 recommendations, rehearse the 90-second pitch, and update your resume and LinkedIn.", go: "analysis", track: "career" },
];
const DELIVERABLES = [
  { id: "d1", t: "Business Requirement Document", d: "Problem, stakeholders, requirements, KPI register, page wireframes.", where: "Problem & Business Questions", track: "business" },
  { id: "d2", t: "Data Dictionary", d: "Every table and column, including the 10 undocumented fact_bookings columns.", where: "Data Dictionary", track: "model" },
  { id: "d3", t: "Data Model", d: "Two facts at two grains, three conformed dimensions, composite key documented.", where: "Data Model", track: "model" },
  { id: "d4", t: "SQL Queries", d: "Load scripts, KPI queries and the mart view, saved as a .sql file.", where: "SQL Lab", track: "sql" },
  { id: "d5", t: "KPI Definitions", d: "Business question, formula and DAX for all 26 measures.", where: "KPI Library", track: "kpi" },
  { id: "d6", t: "Excel Analysis", d: "Booking volume, cancellation, realisation, ADR and rating with live formulas.", where: "Excel Analysis", track: "excel" },
  { id: "d7", t: "Tableau Dashboard", d: "Booking & Occupancy dashboard published to Tableau Public (.twbx).", where: "Dashboard Gallery", track: "tableau" },
  { id: "d8", t: "Power BI Dashboard", d: "Same pages in Power BI (.pbix) with the DAX measures and WoW KPIs.", where: "Dashboard Gallery", track: "powerbi" },
  { id: "d9", t: "QA Validation", d: "Reconciliation sheet: SQL vs Tableau vs Power BI for every P1 KPI.", where: "QA & Reconciliation", track: "qa" },
  { id: "d10", t: "Business Insights", d: "5 insights + 5 recommendations backed by numbers.", where: "Business Analysis", track: "career" },
  { id: "d11", t: "Project Presentation", d: "10–12 slide deck: problem → data → model → KPIs → dashboard → insights.", where: "90-sec Project Pitch", track: "career" },
  { id: "d12", t: "Resume Project Description", d: "Copy-ready project block and 3 tailored bullets.", where: "Resume, LinkedIn & Portfolio", track: "career" },
];
const BEFORE_AFTER = {
  before: ["Bookings, cancellations and occupancy in separate PMS and OTA exports", "Every hotel reports occupancy its own way", "Weekly reports built by hand, days late", "Cancellations noticed only after revenue is lost", "No view of which channel or room class earns", "No single source of truth for the revenue manager"],
  after: ["SQL hotel data mart (5 tables, 2 grains)", "Validated & reconciled data", "Standard KPI register (26 measures)", "Tableau / Power BI dashboard", "Business insights → pricing & channel decisions"],
};

/* ---------------- PROBLEM ---------------- */
const PROBLEM_STATEMENT = M_PROBLEM_STATEMENT;
const REQUIREMENTS = [
  ["R1", "Booking & Occupancy overview", "Revenue Manager, GM, Group leadership", "Revenue, ADR, RevPAR, Occupancy %, Realisation % with WoW change", "P1"],
  ["R2", "Cancellation & no-show view", "Revenue Manager", "Cancellation %, No Show %, status mix, revenue lost to cancellations", "P1"],
  ["R3", "City & category view", "Group leadership", "Revenue and occupancy by city and Luxury vs Business", "P1"],
  ["R4", "Channel & room mix", "Distribution / sales", "Booking % by platform and room class", "P2"],
  ["R5", "Guest experience", "GMs, Ops", "Average rating with coverage (rated stays %)", "P2"],
  ["R6", "Week-over-week trends", "Revenue Manager", "WoW change for Revenue, Occupancy, ADR, RevPAR, Realisation, DSRN", "P1"],
  ["R7", "Global filters", "All users", "Date, week, day type (Fri–Sat weekend), city, category, room class, platform", "P1"],
  ["R8", "Data governance", "QA reviewer", "Every KPI reconciles to SQL within ±0.1; definitions in the KPI register", "P1"],
];
function bq() {
  return [
    { q: "Are we filling our rooms?", data: "fact_aggregated_bookings (capacity, successful_bookings), dim_date", kpi: "Occupancy %, DSRN, DBRN, DURN",
      analysis: "Occupancy = successful bookings ÷ capacity at the property × date × room grain; then turn it into daily room-nights.",
      insight: `Occupancy is ${f1(A.occ)}%. Each day we can sell ${fmtUS(A.dsrn)} room-nights, book ${fmtUS(A.dbrn)} and actually use ${fmtUS(A.durn)}, so roughly 1,500 sellable room-nights a day end up empty.`,
      rec: "Target the weakest city-day combinations with packages and corporate rates rather than group-wide discounts." },
    { q: "How much revenue leaks to cancellations and no-shows?", data: "fact_bookings (booking_status, revenue_generated, revenue_realized)", kpi: "Cancellation %, No Show %, Realisation %",
      analysis: "Count bookings by status; compare revenue_generated with revenue_realized (cancelled bookings keep 60%).",
      insight: `${fmtUS(A.cancelled)} bookings were cancelled (${f1(A.cancel_pct)}%) and ${fmtUS(A.no_show)} were no-shows (${f1(A.noshow_pct)}%), so only ${f1(A.real_pct)}% of bookings became a stay.`,
      rec: "Tighten cancellation windows for high-risk channels and short lead times, and add a deposit for long-stay bookings." },
    { q: "Which city drives revenue?", data: "fact_bookings, dim_hotels (city)", kpi: "Revenue by city",
      analysis: "Sum revenue_realized by city and compare shares.",
      insight: `Mumbai brings ${usdM(668640991)} (${f1(A.mumbai_share)}% of revenue), then Bangalore (24.6%), Hyderabad (19.0%) and Delhi (17.2%).`,
      rec: "Treat Mumbai concentration as a standing risk; grow Delhi and Hyderabad through corporate and event demand." },
    { q: "Is 'Luxury' really our better category?", data: "fact_bookings, dim_hotels (category)", kpi: "Revenue by category, revenue per property",
      analysis: "Divide category revenue by the number of properties in each category.",
      insight: `Luxury earns more in total (${usdM(A.lux_rev)} from 16 hotels) but Business earns more per hotel: $${f1(A.bus_avg)}M vs $${f1(A.lux_avg)}M.`,
      rec: "Check Business hotels' occupancy, location and mix before deciding where to invest; don't rank by category label." },
    { q: "Which channels bring bookings, and can we trust the channel data?", data: "fact_bookings (booking_platform)", kpi: "Booking % by platform",
      analysis: "Booking share per platform, with ALL() in the denominator.",
      insight: `An unnamed 'others' bucket is the biggest channel (${fmtUS(A.others)}, ${f1(A.others_pct)}%), about twice makeyourtrip (20.0%). The four named platforms together still bring more (${fmtUS(A.named4)}).`,
      rec: "Fix channel tagging before any OTA-commission decision; separately, push direct online (9.9%) to cut commission cost." },
    { q: "Which room classes sell?", data: "fact_bookings, dim_rooms", kpi: "Booking % by room class",
      analysis: "Booking share per room class.",
      insight: "Elite is the most booked class (36.8%), then Standard (28.6%), Premium (22.7%) and Presidential (11.9%).",
      rec: "Use Elite as the anchor product in promotions and review Presidential pricing and packaging." },
    { q: "Are guests happy, and how many tell us?", data: "fact_bookings (ratings_given, booking_status)", kpi: "Average Rating, rating coverage",
      analysis: "Average rating over rated stays only, plus the share of checked-out guests who rated.",
      insight: `Average rating is ${A.avg_rating}/5, but only ${fmtUS(A.rated)} bookings are rated. Even among the ${fmtUS(A.checked_out)} completed stays, about ${fmtUS(A.unrated_co)} (${f1(A.unrated_co_pct)}%) left no rating.`,
      rec: "Show rating coverage next to the score, and send a post-checkout feedback request to lift response rates." },
    { q: "Is ADR a fair measure of price here?", data: "fact_bookings (revenue_realized, stay_duration)", kpi: "ADR, RevPAR",
      analysis: "Compare the register's ADR (revenue ÷ bookings) with the industry definition (revenue ÷ room nights).",
      insight: `The register's ADR is $${fmtUS(Math.round(A.adr))} per booking. A 3-night booking counts once, so this is really 'revenue per booking'; RevPAR is $${fmtUS(A.revpar)}.`,
      rec: "Report both: the register ADR for consistency with the BRD, and a room-night ADR using stay_duration for pricing decisions." },
  ];
}

/* ---------------- ORIGINAL BLOCKS ---------------- */
const TOOLS = M_TOOLS;
const DOMAIN_WHAT = M_DOMAIN_WHAT;
const DOMAIN_WHERE = M_DOMAIN_WHERE;
const DOMAIN_DATA_TYPES = M_DOMAIN_DATA_TYPES;
const FLOW = M_FLOW;
const TIMELINE = M_TIMELINE;
const RULES = M_RULES;
const FOCUS_AREAS = M_FOCUS_AREAS;
const SOCIAL = M_SOCIAL;
const SETUP_STEPS = [
  { i: "⬇️", t: "Get the dataset", d: "Your trainer shares the 5 CSV/XLSX files (dim_hotels, dim_rooms, dim_date, fact_bookings, fact_aggregated_bookings)." },
  { i: "🗄️", t: "Import into MySQL", d: "Create the schema, load the 3 dimensions first, then both fact tables." },
  { i: "✅", t: "Verify the load", d: "Row counts must match the Dataset page (fact_bookings 134,590; fact_aggregated_bookings 9,200)." },
  { i: "📊", t: "Connect BI tools", d: "Point Tableau and Power BI at MySQL, not at the Excel files." },
];
const SOFTWARE_LINKS = M_SOFTWARE_LINKS;
const DOCUMENTS = M_DOCUMENTS;

/* ---------------- DATASET ---------------- */
const COVERAGE_TEXT = "92 days: 1-May-2022 to 31-Jul-2022 (dim_date has one row per day, with month, week number and a business-specific day_type where Friday and Saturday are the weekend). 25 hotels (16 Luxury, 9 Business) in Mumbai, Bangalore, Hyderabad and Delhi; 4 room classes. fact_aggregated_bookings has exactly 25 hotels × 92 days × 4 room classes = 9,200 rows. Revenue is shown in $ as in the BRD.";
const STORY = [
  ["Every week", "3 in 10 bookings don't stay", "24.8% cancelled + 5.0% no-show; realisation 70.2%", "Status donut, Realisation % card"],
  ["Always", "Mumbai concentration", "One city = 39% of revenue", "Revenue by city bar"],
  ["Always", "Business beats Luxury per hotel", "$72.9M vs $65.8M revenue per property", "Category comparison"],
  ["Always", "The 'others' channel", "41% of bookings have an unnamed platform", "Booking % by platform"],
  ["Every weekend", "Friday–Saturday weekend", "Stakeholder rule, not Sat–Sun", "Weekday vs weekend split"],
];
const TABLE_TYPES = { "fact_bookings": "Fact", "fact_aggregated_bookings": "Fact", "dim_hotels": "Dimension", "dim_rooms": "Dimension", "dim_date": "Dimension" };
const TABLE_SRC = { "fact_bookings": "fact_bookings", "fact_aggregated_bookings": "fact_aggregated_bookings", "dim_hotels": "dim_hotels", "dim_rooms": "dim_rooms", "dim_date": "dim_date" };
const TABLE_PK = { "fact_bookings": "booking_id", "fact_aggregated_bookings": "(property_id, check_in_date, room_category)", "dim_hotels": "property_id", "dim_rooms": "room_id", "dim_date": "date" };
const TABLE_FK = { "fact_bookings": "property_id, check_in_date, room_category", "fact_aggregated_bookings": "property_id, check_in_date, room_category" };
const TABLE_GRAIN = { "fact_bookings": "1 row per booking", "fact_aggregated_bookings": "1 row per hotel × date × room class", "dim_hotels": "1 row per hotel", "dim_rooms": "1 row per room type", "dim_date": "1 row per day (92)" };
const TABLE_DATE = { "fact_bookings": "booking_date, check_in_date, checkout_date", "fact_aggregated_bookings": "check_in_date", "dim_date": "date, mmm yy, week no, day_type" };
const TABLE_PURPOSE = {
  "fact_bookings": ["Every booking with status, platform, room, guests, rating and revenue.", "Revenue, ADR, cancellations, no-shows, ratings and mix all come from here."],
  "fact_aggregated_bookings": ["Capacity and successful bookings per hotel, day and room class.", "Occupancy % and RevPAR need capacity, which only exists at this grain."],
  "dim_hotels": ["The 25 properties with name, category and city.", "City and Luxury/Business views hang off this table."],
  "dim_rooms": ["The 4 room types (RT1–RT4) and their classes.", "Maps codes to Standard / Elite / Premium / Presidential."],
  "dim_date": ["The 92-day calendar with week number and day_type.", "Powers WoW KPIs and the Friday/Saturday weekend rule."],
};
const RELATIONSHIPS = M_RELATIONSHIPS;
const LOAD_ORDER = M_LOAD_ORDER;
const CALC_FIELDS = M_CALC_FIELDS;
const GOTCHAS = M_GOTCHAS.map(g => g.t.startsWith('"Others"') ? { t: g.t, d: `41% of bookings (55,066 of 134,590) fall into an unnamed "others" platform bucket, about twice the biggest named OTA (makeyourtrip, 26,898). The four named platforms together still bring more (64,663). Treat it as a data-quality gap to flag, not a channel insight.` } : g);
const GLOBAL_FILTERS = M_GLOBAL_FILTERS;
const DASHBOARDS = M_DASHBOARDS;
const NULL_NOTES = M_NULL_NOTES.concat([
  `Ratings are missing for more than cancelled and no-show guests: 56,683 bookings are rated but 94,411 checked out, so at least ${fmtUS(A.unrated_co)} completed stays (${f1(A.unrated_co_pct)}%) have no rating either. Report coverage next to the average.`,
  "fact_aggregated_bookings has exactly 25 × 92 × 4 = 9,200 rows, one per hotel × day × room class. Any extra or missing row is a load error.",
  "The 'others' platform (40.9%) is bigger than any named platform but smaller than the four named ones combined (64,663 bookings). Check the source mapping before using it for channel decisions.",
]);
const DQ_RULES = [
  ["Row counts", "COUNT(*) per table matches the Dataset page", "All 5 tables", "Critical"],
  ["Composite-key uniqueness", "No duplicate (property_id, check_in_date, room_category)", "fact_aggregated_bookings", "Critical"],
  ["Booking key uniqueness", "No duplicate booking_id", "fact_bookings", "Critical"],
  ["Referential integrity", "Every property_id, room_category and check_in_date finds its dimension row", "Both facts", "Critical"],
  ["Status domain", "booking_status ∈ {Checked Out, Cancelled, No Show}", "fact_bookings", "High"],
  ["Revenue logic", "revenue_realized = revenue_generated (Checked Out / No Show) or 60% of it (Cancelled)", "fact_bookings", "High"],
  ["Capacity logic", "successful_bookings ≤ capacity on every row", "fact_aggregated_bookings", "High"],
  ["Date logic", "check_in_date ≤ checkout_date; booking_date ≤ check_in_date", "fact_bookings", "Medium"],
  ["Rating coverage", "Ratings only on Checked Out stays; report coverage %", "fact_bookings", "Medium"],
  ["Weekend rule", "day_type = Weekend only for Friday and Saturday", "dim_date", "High"],
];
const INTERVIEW_TRAPS = [
  ["Revenue = SUM(revenue_generated)", "Use revenue_realized: cancelled bookings keep only 60%"],
  ["Average rating over all bookings", "Average over rated stays and report coverage (42%)"],
  ["Weekend = Saturday and Sunday", "This stakeholder's weekend is Friday + Saturday"],
  ["Join the two fact tables directly", "Relate both to shared dimensions, or join on the full composite key"],
  ["ADR is always revenue ÷ room nights", "This register uses revenue ÷ bookings: state which one you use"],
  ["RevPAR ≥ ADR", "RevPAR ≤ ADR whenever occupancy is below 100%"],
  ["Platform % without ALL()", "Every row shows 100% without removing the platform filter"],
  ["'Others' is our best channel", "It's an unnamed bucket: a data gap, not a channel"],
];
const PRESENTATION = [
  ["01", "Business Problem", "30 sec", "Booking and occupancy data in silos; cancellations seen too late."],
  ["02", "Dataset", "30 sec", "134,590 bookings, 25 hotels, 4 cities, 92 days; two fact grains."],
  ["03", "Data Model", "45 sec", "Shared dimensions, composite key, Friday–Saturday weekend."],
  ["04", "KPIs", "45 sec", "The 8 P1 KPIs: Revenue, ADR, RevPAR, Occupancy, Cancellation, Realisation…"],
  ["05", "Dashboard", "90 sec", "Walk through the overview, cancellation, city and channel pages."],
  ["06", "Insights", "45 sec", "57.9% occupancy, 30% of bookings never stay, Mumbai = 39% of revenue."],
  ["07", "Recommendations", "30 sec", "Cancellation policy by channel, fix 'others' tagging, grow direct bookings."],
];
/* ---------------- SQL LAB (MySQL) ---------------- */
const SQL_BLOCKS = [
  { cat: "Setup", title: "1 · Create the core tables (MySQL)", desc: "Dimensions first, then the two facts. fact_aggregated_bookings has a composite primary key.",
    sql: "CREATE DATABASE shodwe;\nUSE shodwe;\n\nCREATE TABLE dim_hotels (\n  property_id   INT PRIMARY KEY,\n  property_name VARCHAR(60),\n  category      VARCHAR(20),   -- Luxury / Business\n  city          VARCHAR(30)\n);\nCREATE TABLE dim_rooms (room_id VARCHAR(5) PRIMARY KEY, room_class VARCHAR(20));\nCREATE TABLE dim_date (\n  date DATE PRIMARY KEY, `mmm yy` VARCHAR(10), `week no` VARCHAR(10), day_type VARCHAR(10)\n);\nCREATE TABLE fact_bookings (\n  booking_id VARCHAR(30) PRIMARY KEY,\n  property_id INT, booking_date DATE, check_in_date DATE, checkout_date DATE,\n  no_guests INT, room_category VARCHAR(5), booking_platform VARCHAR(30),\n  ratings_given DECIMAL(3,1) NULL, booking_status VARCHAR(15),\n  revenue_generated DECIMAL(12,2), revenue_realized DECIMAL(12,2),\n  FOREIGN KEY (property_id) REFERENCES dim_hotels(property_id)\n);\nCREATE TABLE fact_aggregated_bookings (\n  property_id INT, check_in_date DATE, room_category VARCHAR(5),\n  successful_bookings INT, capacity INT,\n  PRIMARY KEY (property_id, check_in_date, room_category)\n);" },
  { cat: "Setup", title: "2 · Verify the load: row counts", desc: "Every count must match before you build anything.",
    sql: "SELECT 'dim_hotels' t, COUNT(*) FROM dim_hotels                        -- 25\nUNION ALL SELECT 'dim_rooms', COUNT(*) FROM dim_rooms                   -- 4\nUNION ALL SELECT 'dim_date', COUNT(*) FROM dim_date                     -- 92\nUNION ALL SELECT 'fact_bookings', COUNT(*) FROM fact_bookings           -- 134,590\nUNION ALL SELECT 'fact_aggregated_bookings', COUNT(*) FROM fact_aggregated_bookings;  -- 9,200 = 25 × 92 × 4" },
  { cat: "KPI", title: "3 · Revenue, ADR and booking status", desc: "revenue_realized already applies the 40% cancellation deduction.",
    sql: "SELECT SUM(revenue_realized)                         AS revenue,        -- 1,708,771,229\n       COUNT(*)                                      AS bookings,       -- 134,590\n       ROUND(SUM(revenue_realized) / COUNT(*), 0)    AS adr,            -- 12,696\n       SUM(booking_status = 'Checked Out')           AS checked_out,    -- 94,411\n       SUM(booking_status = 'Cancelled')             AS cancelled,      -- 33,420\n       SUM(booking_status = 'No Show')               AS no_show         -- 6,759\nFROM fact_bookings;" },
  { cat: "KPI", title: "4 · Cancellation %, No Show % and Realisation %", desc: "All three share the same denominator, so they add up to 100%.",
    sql: "SELECT ROUND(100 * SUM(booking_status = 'Cancelled')   / COUNT(*), 1) AS cancellation_pct,  -- 24.8\n       ROUND(100 * SUM(booking_status = 'No Show')     / COUNT(*), 1) AS no_show_pct,       -- 5.0\n       ROUND(100 * SUM(booking_status = 'Checked Out') / COUNT(*), 1) AS realisation_pct    -- 70.2\nFROM fact_bookings;" },
  { cat: "KPI", title: "5 · Occupancy %, RevPAR and daily room nights", desc: "Capacity lives only in fact_aggregated_bookings. Sum it there, never after joining to bookings.",
    sql: "SELECT ROUND(100 * SUM(successful_bookings) / SUM(capacity), 1) AS occupancy_pct,  -- 57.9\n       ROUND(SUM(capacity) / 92)            AS dsrn,                             -- 2,528\n       ROUND(SUM(successful_bookings) / 92) AS dbrn                              -- 1,463\nFROM fact_aggregated_bookings;\n\nSELECT ROUND((SELECT SUM(revenue_realized) FROM fact_bookings)\n           / (SELECT SUM(capacity) FROM fact_aggregated_bookings)) AS revpar;    -- 7,347" },
  { cat: "KPI", title: "6 · Average rating and rating coverage", desc: "AVG skips NULLs; report how many stays were rated.",
    sql: "SELECT ROUND(AVG(ratings_given), 2)                       AS avg_rating,          -- 3.62\n       COUNT(ratings_given)                                 AS rated_bookings,      -- 56,683\n       ROUND(100 * COUNT(ratings_given) / COUNT(*), 1)     AS coverage_all_pct,    -- 42.1\n       SUM(booking_status = 'Checked Out' AND ratings_given IS NULL) AS unrated_stays\nFROM fact_bookings;" },
  { cat: "Breakdown", title: "7 · Revenue by city and by category", desc: "Add revenue per property to compare Luxury and Business fairly.",
    sql: "SELECT h.city, SUM(b.revenue_realized) AS revenue\nFROM fact_bookings b JOIN dim_hotels h ON h.property_id = b.property_id\nGROUP BY h.city ORDER BY revenue DESC;     -- Mumbai 668,640,991 first\n\nSELECT h.category, COUNT(DISTINCT h.property_id) AS hotels,\n       SUM(b.revenue_realized) AS revenue,\n       ROUND(SUM(b.revenue_realized) / COUNT(DISTINCT h.property_id)) AS revenue_per_hotel\nFROM fact_bookings b JOIN dim_hotels h ON h.property_id = b.property_id\nGROUP BY h.category;   -- Business 9 hotels ≈ 72.9M each · Luxury 16 hotels ≈ 65.8M each" },
  { cat: "Breakdown", title: "8 · Booking % by platform and room class (window function)", desc: "SUM() OVER () is the SQL version of DAX's ALL().",
    sql: "SELECT booking_platform, COUNT(*) AS bookings,\n       ROUND(100 * COUNT(*) / SUM(COUNT(*)) OVER (), 1) AS share_pct\nFROM fact_bookings\nGROUP BY booking_platform ORDER BY bookings DESC;   -- others 40.9 · makeyourtrip 20.0 · logtrip 11.0 ...\n\nSELECT r.room_class, COUNT(*) AS bookings,\n       ROUND(100 * COUNT(*) / SUM(COUNT(*)) OVER (), 1) AS share_pct\nFROM fact_bookings b JOIN dim_rooms r ON r.room_id = b.room_category\nGROUP BY r.room_class ORDER BY bookings DESC;      -- Elite 36.8 · Standard 28.6 · Premium 22.7 · Presidential 11.9" },
  { cat: "Breakdown", title: "9 · Weekday vs weekend (Friday–Saturday rule)", desc: "Use dim_date.day_type, never DAYNAME() logic of your own.",
    sql: "SELECT d.day_type,\n       COUNT(*) AS bookings,\n       ROUND(SUM(b.revenue_realized) / COUNT(*)) AS adr\nFROM fact_bookings b JOIN dim_date d ON d.date = b.check_in_date\nGROUP BY d.day_type;\n\n-- check the rule itself: only Fri and Sat should be 'Weekend'\nSELECT DAYNAME(date) AS dow, day_type, COUNT(*) FROM dim_date GROUP BY 1, 2 ORDER BY 1;" },
  { cat: "Breakdown", title: "10 · Week-over-week revenue change", desc: "LAG() gives the prior week, exactly like the WoW DAX measures.",
    sql: "WITH wk AS (\n  SELECT d.`week no` AS wn, SUM(b.revenue_realized) AS revenue\n  FROM fact_bookings b JOIN dim_date d ON d.date = b.check_in_date\n  GROUP BY d.`week no`\n)\nSELECT wn, revenue,\n       ROUND(100 * (revenue / LAG(revenue) OVER (ORDER BY wn) - 1), 1) AS revenue_wow_pct\nFROM wk ORDER BY wn;" },
  { cat: "Mart view", title: "11 · The mart view (vw_hotel_booking_analysis)", desc: "The BRD's single view for BI. Note: capacity repeats on every booking row, so never SUM it from this view.",
    sql: M_SQL_BLOCKS[5].sql.replace("fb.room_category = dr.room_class", "fb.room_category = dr.room_id  -- room_category holds RT1–RT4 = room_id") },
];

const QA_SQL = M_SQL_BLOCKS.slice(0, 5).map((b, i) => ({ title: "QA " + (i + 1) + " · " + b.title.replace(/^\d+ · /, ""), desc: b.desc, sql: b.sql }));
{ const q5 = QA_SQL[4]; const k = q5.sql.indexOf("SELECT SUM(revenue_realized) / SUM(capacity)");
  if (k >= 0) { q5.sql = q5.sql.slice(0, k) + "SELECT (SELECT SUM(revenue_realized) FROM fact_bookings)\n     / (SELECT SUM(capacity) FROM fact_aggregated_bookings);              -- RevPAR ≈ $7,347\n-- ✗ don't SUM(capacity) after joining to fact_bookings: capacity repeats on every booking row"; q5.desc += " (RevPAR fixed: sum capacity in its own table, not after a join.)"; } }

const QA_CHECKLIST = [
  { id: "q1", t: "Row counts match", d: "All 5 tables match; fact_aggregated_bookings = 9,200." },
  { id: "q2", t: "Revenue uses revenue_realized", d: "$1,708,771,229 in SQL, Tableau and Power BI." },
  { id: "q3", t: "Occupancy from the aggregated fact", d: "57.9%, with capacity summed at its own grain." },
  { id: "q4", t: "Status rates add to 100%", d: "Cancellation 24.8% + No Show 5.0% + Realisation 70.2%." },
  { id: "q5", t: "Weekend rule", d: "Friday + Saturday = Weekend in every weekday/weekend visual." },
  { id: "q6", t: "Mix % use ALL()", d: "Platform and room-class shares add to 100% across rows." },
  { id: "q7", t: "Rating shown with coverage", d: "3.62 / 5 next to 'rated stays' count." },
  { id: "q8", t: "Definitions documented", d: "Each KPI card links back to its KPI Library definition." },
];

/* ---------------- EXCEL ---------------- */
const EXCEL_TASKS = [
  ["Total bookings", "=COUNTA(booking_id)", "134,590", "Starter ✓"],
  ["Cancellation %", "=COUNTIFS(booking_status,\"Cancelled\")/COUNTA(booking_id)", "24.8%", "Starter ✓"],
  ["Realisation %", "=COUNTIFS(booking_status,\"Checked Out\")/COUNTA(booking_id)", "70.2%", "Starter ✓"],
  ["ADR", "=SUM(revenue_realized)/COUNTA(booking_id)", "$12,696", "Starter ✓"],
  ["Average rating", "=AVERAGE(ratings_given)", "3.62", "Starter ✓"],
  ["City lookup", "=XLOOKUP(property_id, dim_hotels[property_id], dim_hotels[city])", "4 cities", "Your task"],
  ["Weekend flag", "=IF(OR(WEEKDAY(date,1)=6, WEEKDAY(date,1)=7),\"Weekend\",\"Weekday\")", "Fri + Sat", "Your task"],
  ["Occupancy %", "=SUM(successful_bookings)/SUM(capacity)", "57.9%", "Your task"],
  ["Rating coverage", "=COUNT(ratings_given)/COUNTA(booking_id)", "42.1%", "Your task"],
  ["Platform share", "=COUNTIFS(booking_platform,\"others\")/COUNTA(booking_id)", "40.9%", "Your task"],
];
const PIVOTS = [
  { n: "01", h: "Revenue by city × category", p: "Rows: city · Columns: category · Values: Sum of revenue_realized. Mumbai leads; compare per-hotel revenue too." },
  { n: "02", h: "Booking status by platform", p: "Rows: booking_platform · Columns: booking_status · show as % of row total. Which channel cancels most?" },
  { n: "03", h: "Occupancy by date", p: "From fact_aggregated_bookings: Rows: check_in_date · Values: Sum successful_bookings ÷ Sum capacity." },
  { n: "04", h: "Room class mix", p: "Rows: room class · Values: Count of booking_id, % of column total." },
  { n: "05", h: "Rating by city", p: "Rows: city · Values: Average of ratings_given and Count of ratings_given (coverage)." },
];

/* ---------------- GALLERY ---------------- */
function galleryPages() {
  const m = MD, a = A;
  return [
    { n: "01", t: "Booking & Occupancy Overview", q: "How is the group performing this period?", ins: `$1.71B revenue, ${f1(a.occ)}% occupancy, ADR $${fmtUS(Math.round(a.adr))}, RevPAR $${fmtUS(a.revpar)}.`, iq: "Why is RevPAR lower than ADR?", aud: "Revenue Manager · GMs · Leadership", keys: ["Revenue", "Occupancy %", "ADR", "RevPAR"],
      desc: "The dashboard's main page: headline KPIs with week-over-week change and daily room nights.",
      mock: { title: "Booking & Occupancy Overview", sub: "May–Jul 2022, 25 hotels",
        kpis: [{ v: "$1.71B", l: "Revenue (realized)" }, { v: f1(a.occ) + "%", l: "Occupancy" }, { v: "$" + fmtUS(Math.round(a.adr)), l: "ADR" }, { v: "$" + fmtUS(a.revpar), l: "RevPAR" }, { v: f1(a.real_pct) + "%", l: "Realisation" }, { v: a.avg_rating + "/5", l: "Avg rating" }],
        donuts: [{ title: "Booking status", data: m.status }],
        bars: [{ title: "Daily room nights", data: m.daily }, { title: "Revenue by city ($M)", data: m.city_rev_m }] },
      build: { tableau: ["Occupancy from the aggregated table as a separate data source / relationship", "WoW via LOOKUP(SUM([Revenue]), -1) on week", "Day type from dim_date, not a calc"],
               powerbi: ["Measures from the register; mark dim_date as date table", "WoW measures using the wn column", "Cards with WoW % and conditional colour"] } },
    { n: "02", t: "Cancellations & Realisation", q: "How much do we lose before guests arrive?", ins: `${f1(a.cancel_pct)}% cancelled + ${f1(a.noshow_pct)}% no-show: only ${f1(a.real_pct)}% of bookings become stays.`, iq: "Why use revenue_realized and not revenue_generated?", aud: "Revenue Manager", keys: ["Cancellation %", "No Show %", "Realisation %", "Status"],
      desc: "Drill-through page: booking outcomes and the revenue at stake.",
      mock: { title: "Cancellations & Realisation", sub: "booking_status, real numbers",
        kpis: [{ v: fmtUS(a.cancelled), l: "Cancelled" }, { v: f1(a.cancel_pct) + "%", l: "Cancellation %" }, { v: fmtUS(a.no_show), l: "No shows" }, { v: f1(a.real_pct) + "%", l: "Realisation %" }],
        donuts: [{ title: "Outcome mix", data: m.status }], bars: [{ title: "Outcome %", data: m.status_pct, suffix: "%" }] },
      build: { tableau: ["Status as colour on a 100% stacked bar by platform", "Parameter for week", "Tooltip with revenue lost"], powerbi: ["Cancellation % and No Show % from the register", "Drill-through from city", "Matrix: platform × status"] } },
    { n: "03", t: "City & Category", q: "Where does revenue come from?", ins: `Mumbai = ${f1(a.mumbai_share)}% of revenue; Business hotels earn $${f1(a.bus_avg)}M each vs $${f1(a.lux_avg)}M for Luxury.`, iq: "Why compare revenue per hotel and not total revenue by category?", aud: "Group leadership", keys: ["City", "Category", "Revenue/hotel"],
      desc: "Drill-through page: city and Luxury vs Business performance.",
      mock: { title: "City & Category", sub: "dim_hotels × fact_bookings",
        kpis: [{ v: f1(a.mumbai_share) + "%", l: "Mumbai share" }, { v: "16 / 9", l: "Luxury / Business hotels" }, { v: "$" + f1(a.bus_avg) + "M", l: "Revenue per Business hotel" }, { v: "$" + f1(a.lux_avg) + "M", l: "Revenue per Luxury hotel" }],
        donuts: [{ title: "Revenue by category ($M)", data: m.cat_rev_m }], bars: [{ title: "Revenue share by city", data: m.city_share, suffix: "%" }, { title: "Revenue per hotel by category ($M)", data: m.cat_avg_m }] },
      build: { tableau: ["Map of 4 cities sized by revenue", "Calc: SUM(Revenue)/COUNTD(property_id)", "Category filter action"], powerbi: ["Revenue per Hotel = DIVIDE([Revenue], DISTINCTCOUNT(dim_hotels[property_id]))", "Small multiples by city", "Category slicer"] } },
    { n: "04", t: "Channel, Room & Guest", q: "Who books, through what, and are they happy?", ins: `'others' = ${f1(a.others_pct)}% of bookings; Elite is the top room class (36.8%); rating 3.62 on 42% coverage.`, iq: "Why does Booking % by Platform need ALL()?", aud: "Distribution · GMs", keys: ["Platform %", "Room class %", "Rating"],
      desc: "Drill-through page: booking mix and guest experience.",
      mock: { title: "Channel, Room & Guest", sub: "fact_bookings mix",
        kpis: [{ v: f1(a.others_pct) + "%", l: "'others' platform" }, { v: "20.0%", l: "makeyourtrip" }, { v: "36.8%", l: "Elite room class" }, { v: f1(a.rated_pct) + "%", l: "Bookings rated" }],
        donuts: [{ title: "Room class", data: m.room }], bars: [{ title: "Booking % by platform (top 5)", data: m.platform_pct, suffix: "%" }, { title: "Rating coverage", data: m.rating_cov }] },
      build: { tableau: ["Percent of total table calc for platform share", "Highlight 'others' in grey with an annotation", "Rating + COUNT(rating) together"], powerbi: ["Booking % = DIVIDE([Total Bookings], CALCULATE([Total Bookings], ALL(fact_bookings[booking_platform])))", "Card: rated stays", "Bar sorted by share"] } },
  ];
}

/* ---------------- ASSIGNMENTS ---------------- */
function assignments() {
  const a = A;
  return [
    { id: "a1", tool: "Data Exploration · Excel or SQL", track: "business", t: "How many bookings are in fact_bookings?", task: ["Open fact_bookings.", "Count booking_id.", "Check it against the Dataset page."], type: "num", ans: a.bookings, tol: 0, unit: "bookings", hint: "One row per booking.", sol: "SELECT COUNT(*) FROM fact_bookings;   -- 134,590" },
    { id: "a2", tool: "SQL", track: "kpi", t: "What is the Cancellation %? (one decimal)", task: ["Cancelled ÷ total bookings × 100.", "One decimal."], type: "num", ans: 24.8, tol: 0.1, unit: "%", hint: "33,420 ÷ 134,590.", sol: "SELECT ROUND(100 * SUM(booking_status = 'Cancelled') / COUNT(*), 1) FROM fact_bookings;   -- 24.8" },
    { id: "a3", tool: "SQL", track: "sql", t: "How many bookings were No Shows?", task: ["Filter booking_status = 'No Show'.", "Count rows."], type: "num", ans: a.no_show, tol: 0, unit: "bookings", hint: "It's about 5% of bookings.", sol: "SELECT COUNT(*) FROM fact_bookings WHERE booking_status = 'No Show';   -- 6,759" },
    { id: "a4", tool: "SQL · KPI", track: "kpi", t: "What is the Realisation %? (one decimal)", task: ["Checked Out ÷ total bookings × 100.", "Or 100 − Cancellation % − No Show %."], type: "num", ans: 70.2, tol: 0.1, unit: "%", hint: "94,411 checked out.", sol: "SELECT ROUND(100 * SUM(booking_status = 'Checked Out') / COUNT(*), 1) FROM fact_bookings;   -- 70.2" },
    { id: "a5", tool: "Excel", track: "excel", t: "What is the ADR (revenue ÷ bookings), to the nearest dollar?", task: ["SUM(revenue_realized).", "Divide by COUNTA(booking_id).", "Round to whole dollars."], type: "num", ans: Math.round(a.adr), tol: 1, unit: "$", hint: "Use revenue_realized, not revenue_generated.", sol: "=SUM(revenue_realized)/COUNTA(booking_id)   → 12,696" },
    { id: "a6", tool: "Tableau", track: "tableau", t: "Build revenue by city. Which city earns the most?", task: ["Join fact_bookings to dim_hotels.", "Bar: city vs SUM(revenue_realized).", "Read the top bar."], type: "select", options: ["Mumbai", "Bangalore", "Hyderabad", "Delhi"], ans: "Mumbai", hint: "It holds about 39% of revenue.", sol: "Mumbai: $668,640,991 (39.1%)." },
    { id: "a7", tool: "Power BI", track: "powerbi", t: "Write the Occupancy % measure. What does it return? (one decimal)", task: ["Use fact_aggregated_bookings.", "DIVIDE(successful bookings, capacity).", "Card with one decimal."], type: "num", ans: 57.9, tol: 0.1, unit: "%", hint: "Capacity only exists in the aggregated table.", sol: "Occupancy % = DIVIDE(SUM(fact_aggregated_bookings[successful_bookings]), SUM(fact_aggregated_bookings[capacity]), 0)   -- 57.9%" },
    { id: "a8", tool: "SQL · KPI", track: "sql", t: "What share of all bookings has a rating? (one decimal)", task: ["COUNT(ratings_given) ÷ COUNT(*).", "One decimal."], type: "num", ans: a.rated_pct, tol: 0.1, unit: "%", hint: "56,683 rated bookings.", sol: "SELECT ROUND(100 * COUNT(ratings_given) / COUNT(*), 1) FROM fact_bookings;   -- 42.1" },
    { id: "a9", tool: "QA", track: "qa", t: "How many rows should fact_aggregated_bookings have, and why?", task: ["Count hotels, days and room classes.", "Multiply.", "Compare with COUNT(*)."], type: "num", ans: 9200, tol: 0, unit: "rows", hint: "25 hotels × 92 days × 4 room classes.", sol: "25 × 92 × 4 = 9,200 = one row per hotel per day per room class. More rows = duplicate keys; fewer = missing days." },
    { id: "a10", tool: "Data Model", track: "model", t: "At least how many CHECKED-OUT stays have no rating?", task: ["Checked-out stays: 94,411.", "Rated bookings: 56,683 (ratings only exist on stays).", "Subtract."], type: "num", ans: a.unrated_co, tol: 0, unit: "stays", hint: "It's about 40% of completed stays.", sol: "94,411 − 56,683 = 37,728 completed stays without a rating. So missing ratings aren't only cancelled/no-show bookings." },
    { id: "a11", tool: "Data Quality", track: "model", t: "What % of bookings come through the unnamed 'others' platform? (one decimal)", task: ["Count booking_platform = 'others'.", "Divide by total bookings."], type: "num", ans: a.others_pct, tol: 0.1, unit: "%", hint: "55,066 bookings.", sol: "55,066 ÷ 134,590 = 40.9%. Bigger than any named platform, but smaller than the four named ones combined (64,663)." },
    { id: "a12", tool: "Business Analysis", track: "career", t: "Which hotel category earns more revenue PER HOTEL?", task: ["Revenue by category.", "Divide by the number of hotels in each category.", "Compare."], type: "select", options: ["Luxury", "Business"], ans: "Business", hint: "Luxury has 16 hotels, Business 9.", sol: "Business: $656.0M ÷ 9 = $72.9M per hotel. Luxury: $1,052.8M ÷ 16 = $65.8M per hotel." },
  ];
}

/* ---------------- LAB ---------------- */
const LAB = [
  { t: "Occupancy up, revenue down", scn: "A GM: 'Occupancy was 92% last week but revenue was lower than a 78% week.'", opts: [["Say the data is wrong", "weak"], ["Compare ADR, room-class mix and channel mix between the two weeks", "best"], ["Raise prices", "weak"], ["Check cancellations", "ok"]],
    exp: ["Revenue = occupied rooms × price: high occupancy at a low ADR can earn less.", "Check if cheaper room classes or discounted channels filled the extra rooms.", "Show RevPAR for both weeks: it combines both effects."] },
  { t: "Cancellation spike", scn: "Cancellation rate jumped from 18% to 31% in Mumbai over 10 days.", opts: [["Change the cancellation policy at once", "weak"], ["Split by platform, lead time, room class and property", "best"], ["Wait a week", "weak"], ["Ask hotel staff", "ok"]],
    exp: ["Find where the extra cancellations come from before acting.", "Often one OTA or short-lead bookings explain most of it.", "Then a targeted rule (deposit, non-refundable rate) for that segment."] },
  { t: "Revenue doesn't match finance", scn: "Your dashboard shows $1.71B; a quick SUM in Excel shows a higher number.", opts: [["Use the bigger number", "weak"], ["Check if Excel summed revenue_generated", "best"], ["Refresh the dashboard", "ok"], ["Ignore it", "weak"]],
    exp: ["revenue_generated includes the 40% refunded on cancellations.", "revenue_realized is what the hotel keeps.", "Agree the definition with finance and label it on the card."] },
  { t: "Every platform shows 100%", scn: "Your Booking % by Platform table shows 100% on every row.", opts: [["Hide the column", "weak"], ["Add ALL() to the denominator", "best"], ["Use a pie chart", "weak"], ["Recalculate in Excel", "ok"]],
    exp: ["The row filter applies to both numerator and denominator.", "CALCULATE([Total Bookings], ALL(fact_bookings[booking_platform])) removes it from the denominator.", "Check the shares add to 100%."] },
  { t: "'Others' is our best channel?", scn: "Marketing wants to cut OTA spend because 'others' brings 41% of bookings.", opts: [["Agree", "weak"], ["Find out what 'others' contains before any decision", "best"], ["Cut all OTAs", "weak"], ["Merge 'others' into direct", "weak"]],
    exp: ["'Others' is unnamed: it may be several channels, including OTAs.", "The four named platforms together still bring more bookings (64,663).", "Fix the tagging, then decide."] },
  { t: "Weekend looks weak", scn: "Your weekend occupancy is lower than the revenue manager expects.", opts: [["Accept it", "weak"], ["Check the day_type rule: Fri + Sat, not Sat + Sun", "best"], ["Remove Sunday", "weak"], ["Use calendar weekends", "weak"]],
    exp: ["The stakeholder's weekend is Friday and Saturday.", "Sunday is usually a low night; including it drags 'weekend' down.", "Use dim_date.day_type everywhere."] },
  { t: "Great rating, few raters", scn: "The CEO wants to advertise 'guests rate us 3.6+'. Only 42% of bookings are rated.", opts: [["Advertise it", "weak"], ["Show coverage and check who rates", "best"], ["Treat blanks as 0", "weak"], ["Drop low ratings", "weak"]],
    exp: ["Even among completed stays, 40% didn't rate.", "Unhappy guests may be under- or over-represented.", "Report score with coverage; push post-checkout surveys."] },
  { t: "Which is our best hotel?", scn: "The CEO asks for one 'best hotel' in a meeting.", opts: [["Highest revenue hotel", "weak"], ["Ask: best by what? Then show RevPAR, occupancy and rating together", "best"], ["Highest rating", "ok"], ["Refuse to answer", "weak"]],
    exp: ["Revenue favours big hotels; RevPAR is fairer across sizes.", "Show 2–3 KPIs side by side and name a winner per KPI.", "Agree one KPI for future 'best hotel' questions."] },
  { t: "Luxury vs Business budget", scn: "Leadership plans to put the renovation budget into Luxury hotels 'because they earn more'.", opts: [["Agree", "weak"], ["Compare revenue per hotel and occupancy by category", "best"], ["Split equally", "ok"], ["Ask GMs", "weak"]],
    exp: ["Luxury earns more in total only because there are 16 Luxury hotels vs 9 Business.", "Per hotel, Business earns more ($72.9M vs $65.8M).", "Decide on per-hotel returns, not category totals."] },
  { t: "RevPAR higher than ADR", scn: "A teammate's card shows RevPAR above ADR.", opts: [["Ship it", "weak"], ["Check how capacity was summed", "best"], ["Swap the cards", "weak"], ["Round the numbers", "weak"]],
    exp: ["RevPAR ≤ ADR whenever occupancy < 100%.", "Capacity was probably summed after joining bookings, which changes the denominator.", "Sum capacity in fact_aggregated_bookings only."] },
];

/* ---------------- INTERVIEW ---------------- */
const QA_CATS = M_QA_CATS.concat(["Hotel Revenue Management"]);
const QA = M_QA.map(q => ({ ...q, a: q.a.replace(/larger than the top 4 named platforms[^.]*combined/gi, "about twice the biggest named platform").replace(/ahead of every named platform combined/gi, "ahead of every single named platform") }));
QA.push(
  { cat: "Explain This Project", q: "What was your most important insight?", a: `Three in ten bookings never become a stay: ${f1(A.cancel_pct)}% cancel and ${f1(A.noshow_pct)}% don't show, so realisation is ${f1(A.real_pct)}%. Second, revenue is concentrated: Mumbai alone is ${f1(A.mumbai_share)}%. And Business hotels earn more per property than Luxury ($72.9M vs $65.8M), which changes where investment should go.`, signal: "Tests a quantified 'so what'." },
  { cat: "Data Modeling", q: "Why does fact_aggregated_bookings have exactly 9,200 rows?", a: "Its grain is one row per hotel per day per room class: 25 hotels × 92 days × 4 room classes = 9,200. Knowing the expected count lets you catch missing days or duplicate keys immediately.", signal: "Tests grain thinking with a check you can run." },
  { cat: "Hotel Revenue Management", q: "What is the difference between ADR, RevPAR and Occupancy?", a: "Occupancy = rooms sold ÷ rooms available. ADR = room revenue ÷ rooms sold (price). RevPAR = room revenue ÷ rooms available = ADR × Occupancy. RevPAR is the single best measure of how well a hotel monetises its inventory.", signal: "The core hotel-metrics question." },
  { cat: "Hotel Revenue Management", q: "What is GOPPAR and why might a GM prefer it to RevPAR?", a: "Gross Operating Profit Per Available Room: profit, not revenue, divided by available rooms. It captures costs (labour, commissions, F&B), so a hotel can raise RevPAR with expensive OTA bookings and still see GOPPAR fall.", signal: "Tests profit-awareness beyond revenue KPIs." },
  { cat: "Hotel Revenue Management", q: "What is ALOS and how would you compute it here?", a: "Average Length of Stay = total room nights ÷ number of stays. Here: AVG(DATEDIFF(checkout_date, check_in_date)) over checked-out bookings, or use stay_duration. It matters for ADR: per-booking ADR overstates price when stays are long.", signal: "Tests a common metric and its link to ADR." },
  { cat: "Hotel Revenue Management", q: "What is booking lead time / booking window?", a: "Days between booking_date and check_in_date. Short lead times often cancel or no-show more, and lead-time curves are the basis of pace reports and dynamic pricing.", signal: "Tests revenue-management vocabulary." },
  { cat: "Hotel Revenue Management", q: "What is a pace report?", a: "It compares bookings on the books for a future period with where you were at the same lead time last year (or last month). It tells the revenue manager early whether demand is ahead or behind, so prices can move before the date arrives.", signal: "Practical RM tool." },
  { cat: "Hotel Revenue Management", q: "Why do hotels overbook, and what metric tells you how much?", a: "Because a predictable share of bookings cancel or no-show. With ~5% no-shows and ~25% cancellations, a hotel can safely accept more bookings than rooms for high-demand dates. The no-show and late-cancellation rates by segment set the overbooking level; walk costs set the limit.", signal: "Connects this project's KPIs to a real decision." },
  { cat: "Hotel Revenue Management", q: "How do OTA commissions change the picture?", a: "OTAs typically charge a commission per booking, so the same ADR earns less net revenue through an OTA than through direct online. Compare net ADR (after commission) by channel; growing direct share (9.9% here) is usually the cheapest revenue lever.", signal: "Channel economics." },
  { cat: "Hotel Revenue Management", q: "What is the difference between revenue_generated and revenue_realized?", a: "revenue_generated is the booking value; revenue_realized is what the hotel keeps: the full amount for checked-out and no-show bookings, 60% for cancellations (40% refunded). Revenue KPIs must use revenue_realized.", signal: "Project-specific definition check." },
  { cat: "Scenario-Based", q: "Leadership wants the 'others' channel cut from the dashboard because 'it confuses people'. What do you do?", a: "Keep it, but label it clearly as 'Unidentified platform (41%)' and add a data-quality note. Hiding 55,066 bookings would make every channel share wrong. In parallel, ask the source owners to map 'others' to real channels.", signal: "Tests integrity under stakeholder pressure." },
);

const GLOSSARY = M_GLOSSARY.concat([
  { t: "Realisation %", d: "Checked-out bookings ÷ total bookings. 70.2% here." },
  { t: "revenue_realized", d: "Revenue the hotel keeps: 100% for stays and no-shows, 60% for cancellations." },
  { t: "GOPPAR", d: "Gross Operating Profit Per Available Room: a profit version of RevPAR." },
  { t: "ALOS", d: "Average Length of Stay: room nights ÷ stays." },
  { t: "Lead time", d: "Days between booking and check-in." },
  { t: "Pace report", d: "Bookings on the books vs the same point last year, for future dates." },
  { t: "Composite key", d: "A key made of several columns: (property_id, check_in_date, room_category) here." },
  { t: "Rating coverage", d: "Share of bookings (or stays) that have a rating: 42.1% of bookings here." },
]);
const TIPS = M_TIPS;
const TIP_CALLOUT = M_TIP_CALLOUT;
const WEAK_STRONG = M_WEAK_STRONG;

/* ---------------- PITCH ---------------- */
const PITCH_FLOW = [
  { t: "Business Problem", d: "Booking and occupancy data in silos; cancellations seen too late.", s: "~10 s", key: ["problem", "silo", "cancellation", "late"] },
  { t: "Data Sources", d: "134,590 bookings, 25 hotels, 4 cities, 92 days.", s: "~10 s", key: ["134,590", "134590", "25 hotels", "bookings"] },
  { t: "Data Cleaning", d: "revenue_realized, rating coverage, 'others' channel, weekend rule.", s: "~10 s", key: ["clean", "quality", "realized", "others"] },
  { t: "Data Model", d: "Two fact grains, shared dimensions, composite key.", s: "~10 s", key: ["model", "grain", "fact", "composite"] },
  { t: "KPIs", d: "26 measures: Revenue, ADR, RevPAR, Occupancy, Cancellation…", s: "~10 s", key: ["kpi", "revpar", "adr", "occupancy"] },
  { t: "Dashboard", d: "Booking & Occupancy dashboard in Tableau and Power BI, SQL-reconciled.", s: "~10 s", key: ["dashboard", "tableau", "power bi"] },
  { t: "Insights", d: "57.9% occupancy; 30% of bookings never stay; Mumbai = 39% of revenue.", s: "~15 s", key: ["insight", "57.9", "39", "realisation"] },
  { t: "Business Impact", d: "Channel-specific cancellation rules, fix 'others', grow direct.", s: "~15 s", key: ["recommend", "impact", "direct", "policy"] },
];
const ELEVATOR_PITCH = `ShodweStay's revenue team saw bookings, cancellations and occupancy in separate exports, so they learned about lost revenue only after the fact. I built a hospitality analytics solution on 134,590 bookings across 25 hotels in 4 cities over 92 days. The data has two grains, individual bookings and daily capacity per hotel and room class, so I modelled two fact tables on shared dimensions and kept capacity at its own grain for Occupancy and RevPAR. I implemented the 26-measure KPI register in Tableau and Power BI, reconciled to SQL. The findings: occupancy is 57.9%, three in ten bookings never become a stay because 24.8% cancel and 5% don't show, Mumbai brings 39% of revenue, and Business hotels earn more per property than Luxury. I also flagged that 41% of bookings come through an unnamed 'others' platform, so channel decisions need better tagging first. I recommended channel-specific cancellation rules, fixing the platform tagging and growing direct bookings.`;
const PROJECT_FAQ = M_PROJECT_FAQ;
const RESUME_PROJECT = {
  title: "Hotel Booking & Occupancy Analytics — ShodweStay (Capstone)",
  tools: "Tools: SQL (MySQL) | Excel | Tableau | Power BI | DAX",
  bullets: [
    "Analyzed 134,590 hotel bookings across 25 properties and 4 cities (May–Jul 2022) from a 5-table dataset",
    "Modelled two fact tables at different grains (bookings vs daily capacity) on shared hotel, room and date dimensions",
    "Implemented a 26-measure KPI register: Revenue, ADR, RevPAR, Occupancy %, Cancellation %, Realisation % and WoW trends",
    "Built a Booking & Occupancy dashboard in Tableau and Power BI with city, category, channel and room-class drill-throughs",
    "Reconciled all P1 KPIs between SQL and both BI tools",
    "Showed 30% of bookings never convert to stays and Business hotels out-earn Luxury per property, informing policy and investment",
  ],
};
const RESUME_BULLETS = M_RESUME_BULLETS.map(b => b.replace(/larger than the top 4 named platforms combined/gi, "about twice the biggest named platform"));
const LINKEDIN_POST = "Just wrapped up my Hospitality Analytics capstone 🏨\n\nThe problem: bookings, cancellations and occupancy lived in separate exports.\n\nWhat I built:\n📊 A 5-table hotel data model (134,590 bookings, 25 hotels, 4 cities)\n🧮 26 KPIs: Revenue, ADR, RevPAR, Occupancy, Cancellation %, Realisation %\n📈 Booking & Occupancy dashboard in Tableau & Power BI, reconciled with SQL\n\nBiggest insight: 3 in 10 bookings never become a stay (24.8% cancel, 5% no-show).\n\nThanks to Mahendra Singh for the guidance!\n\n#DataAnalytics #Hospitality #RevenueManagement #PowerBI #Tableau #SQL";
const PORTFOLIO = [
  { n: "01", h: "Publish to Tableau Public", p: "Upload the .twbx with a clear title and KPI definitions in tooltips." },
  { n: "02", h: "Record a 2-minute walkthrough", p: "Screen-record the dashboard while giving your 90-second pitch." },
  { n: "03", h: "GitHub repo", p: "SQL scripts, data dictionary, KPI register and screenshots, with a clear README." },
  { n: "04", h: "Write a Medium post", p: "\"Why RevPAR beats occupancy\" or \"Two fact grains in one hotel model\" make great short write-ups." },
  { n: "05", h: "Add it to LinkedIn Featured", p: "Pin the Tableau Public link and the video." },
  { n: "06", h: "Prepare the deck", p: "10–12 slides: problem, data, model, KPIs, dashboard, insights, recommendations, QA." },
];
const LEARNING_LINKS = [
  { title: "90-Day AI Learning", desc: "After this project, start your AI journey: a 90-day, week-by-week AI engineer learning plan with a project every week.", url: "https://90daysailearning.vercel.app/", source: "AI Learning" },
  { title: "Data Analyst Roadmap (roadmap.sh)", desc: "A step-by-step visual roadmap of every skill a data analyst needs.", url: "https://roadmap.sh/data-analyst", source: "roadmap.sh" },
].concat(M_LEARNING_LINKS);

/* ---------------- CHAT ---------------- */
const SYNONYMS = { "revpar": ["revenue per available room"], "adr": ["average daily rate"], "occupancy": ["capacity", "successful"], "cancel": ["cancellation", "cancelled"],
  "rating": ["ratings_given", "coverage"], "weekend": ["day_type", "friday"], "platform": ["channel", "others"], "dax": ["measure", "power bi"], "sql": ["query", "select"], "trap": ["gotcha", "mistake"] };
const INTENT_RULES = [
  { re: /revpar/i, title: "What is the difference between ADR, RevPAR and Occupancy?" },
  { re: /weekend|day.?type|friday/i, title: "Friday + Saturday = \"Weekend\"" },
  { re: /realized|generated/i, title: "What is the difference between revenue_generated and revenue_realized?" },
  { re: /9,?200|aggregated/i, title: "Why does fact_aggregated_bookings have exactly 9,200 rows?" },
];
const CHAT_POPULAR = ["What is RevPAR?", "Why Friday + Saturday weekend?", "revenue_realized vs generated", "Why 9,200 rows?", "Give me a scenario question"];
const QUICK_REPLY_POOL = ["What is RevPAR?", "ADR vs RevPAR", "Why Friday + Saturday weekend?", "revenue_realized vs generated", "Why 9,200 rows?", "Rating coverage", "Give me a scenario question"];
/* ============================================================
   References, sample images and 12 common hotel dashboards.
   ============================================================ */
const SRC = {
  star: ["Microsoft Learn: Understand star schema for Power BI", "https://learn.microsoft.com/en-us/power-bi/guidance/star-schema"],
  all: ["Microsoft Learn: ALL function (DAX)", "https://learn.microsoft.com/en-us/dax/all-function-dax"],
  divide: ["Microsoft Learn: DIVIDE function (DAX)", "https://learn.microsoft.com/en-us/dax/divide-function-dax"],
};
const QA_REFERENCES = Object.values(SRC);

const SAMPLE_IMAGE_DASHBOARDS = [
  { img: "assets/dashboard-sample.png", t: "Hotel Management Booking Overview", by: "Reference layout (provided with this capstone)",
    does: "A one-page booking overview: hotel count, profit, rooms, bookings, top hotels and availability by city.",
    kpis: "Hotels, profit, rooms, bookings, room availability", visuals: "KPI cards, top booked hotels bar, availability by city, trend",
    proxima: "Page 01 Overview. Swap 'profit' for Revenue, ADR, RevPAR and Occupancy % from the KPI register." },
  { img: "assets/hero-mockup.png", t: "ShodweStay Concept Dashboard", by: "Concept mockup (illustrative values)",
    does: "Bookings, guests and ADR cards, an occupancy gauge, revenue overview and room-type mix.",
    kpis: "Total bookings, guests, ADR, occupancy, revenue", visuals: "KPI cards, gauge, revenue line, room-type donut",
    proxima: "Layout idea for the overview; replace values with the KPI Library answer key." },
  { img: "assets/problem-statement.png", t: "Problem Statement Visual", by: "Project brief",
    does: "Summarises why the project exists: siloed booking data and late visibility of cancellations.",
    kpis: "—", visuals: "Infographic", proxima: "Use it on slide 1 of your presentation." },
];

const VIDI_DASHBOARDS = [
  { name: "Group Executive Summary", tool: "Power BI / Tableau", tag: "One page for leadership", context: "Replaces the weekly hotel-by-hotel email pack.",
    what: "Revenue, occupancy, ADR, RevPAR and realisation for the group, with WoW change.", question: "Is the group on track this week?", who: "CEO, COO, Revenue director",
    kpis: ["Revenue", "Occupancy %", "ADR", "RevPAR", "Realisation %"], visuals: ["KPI cards with WoW arrows", "Revenue by city", "Weekly trend"], filters: "Week, city, category",
    build: ["Register measures", "WoW measures on the wn column", "Max 6 cards + 4 visuals"], proxima: "$1.71B revenue, 57.9% occupancy, ADR $12,696, RevPAR $7,347.", page: "01 Overview" },
  { name: "Revenue Management (Pricing)", tool: "Power BI", tag: "Are we priced right?", context: "Used daily by revenue managers.",
    what: "ADR and RevPAR by date, day type, room class and channel; rate vs occupancy.", question: "Where can we raise or must we cut rates?", who: "Revenue managers",
    kpis: ["ADR", "RevPAR", "Occupancy %", "ADR by day type"], visuals: ["ADR vs occupancy scatter by hotel", "RevPAR by weekday/weekend", "Room-class ADR"], filters: "Date, hotel, room class",
    build: ["day_type from dim_date (Fri–Sat)", "RevPAR uses capacity from the aggregated fact", "Room-night ADR using stay_duration as an extra view"], proxima: "Compare register ADR ($12,696 per booking) with a room-night ADR.", page: "01 Overview" },
  { name: "Occupancy & Capacity", tool: "Power BI / Tableau", tag: "How full are we, day by day?", context: "Used by GMs and front office.",
    what: "Occupancy by hotel and date, sellable vs booked vs used room nights.", question: "Which nights and hotels have empty rooms?", who: "GMs, revenue managers",
    kpis: ["Occupancy %", "DSRN", "DBRN", "DURN"], visuals: ["Occupancy heatmap: hotel × date", "Daily room-night bars"], filters: "City, hotel, room class",
    build: ["fact_aggregated_bookings only", "No of Days measure for daily averages", "Heatmap with conditional colour"], proxima: "DSRN 2,528 vs DURN 1,026 per day.", page: "01 Overview" },
  { name: "Cancellation & No-Show", tool: "Power BI", tag: "Where do bookings fall through?", context: "Used to set cancellation and deposit policy.",
    what: "Cancellation and no-show rates by channel, lead time, room class and city; revenue lost.", question: "Which segments cancel most?", who: "Revenue managers, distribution",
    kpis: ["Cancellation %", "No Show %", "Realisation %", "Revenue lost"], visuals: ["Status by platform 100% bar", "Cancellation % by lead-time band", "Trend"], filters: "Platform, city, week",
    build: ["Lead time = check_in_date − booking_date", "Revenue lost = revenue_generated − revenue_realized", "Drill-through from platform"], proxima: "24.8% cancelled, 5.0% no-show.", page: "02 Cancellations" },
  { name: "Channel / Distribution Mix", tool: "Power BI / Tableau", tag: "Which channels earn, after commission?", context: "Used to negotiate OTA contracts.",
    what: "Bookings, revenue and cancellation by platform; direct vs OTA share.", question: "Which channels should we grow?", who: "Distribution, marketing",
    kpis: ["Booking % by platform", "Revenue by platform", "Cancellation % by platform"], visuals: ["Platform share bar", "Direct vs OTA trend"], filters: "Platform, city",
    build: ["ALL() in the share denominator", "Flag 'others' as unidentified", "Add commission % per platform to compare net revenue"], proxima: "'others' 40.9%, makeyourtrip 20.0%, direct online 9.9%.", page: "04 Channel, Room & Guest" },
  { name: "City & Property Comparison", tool: "Power BI / Tableau", tag: "Which hotels lead and lag?", context: "Used in monthly business reviews.",
    what: "Revenue, RevPAR, occupancy and rating by city and hotel, Luxury vs Business.", question: "Which properties need attention?", who: "Group leadership, regional managers",
    kpis: ["Revenue", "Revenue per hotel", "RevPAR", "Rating"], visuals: ["Map of cities", "Hotel ranking table", "Category comparison"], filters: "City, category",
    build: ["Revenue per hotel = Revenue ÷ DISTINCTCOUNT(property_id)", "RevPAR per hotel for size-fair ranking", "RLS by region if needed"], proxima: "Mumbai 39.1% of revenue; Business $72.9M vs Luxury $65.8M per hotel.", page: "03 City & Category" },
  { name: "Room Type Performance", tool: "Power BI", tag: "Which rooms sell and earn?", context: "Used for product and upsell decisions.",
    what: "Bookings, ADR and occupancy by room class.", question: "Which room classes to promote or reprice?", who: "Revenue managers, sales",
    kpis: ["Booking % by room class", "ADR by room class", "Occupancy by room class"], visuals: ["Room-class share", "ADR by class bar"], filters: "City, hotel",
    build: ["dim_rooms maps RT1–RT4 to classes", "ALL(dim_rooms[room_class]) in share", "Occupancy from aggregated fact by room_category"], proxima: "Elite 36.8%, Standard 28.6%, Premium 22.7%, Presidential 11.9%.", page: "04 Channel, Room & Guest" },
  { name: "Guest Experience", tool: "Power BI / Tableau", tag: "Are guests happy?", context: "Used by GMs and operations.",
    what: "Average rating, rating distribution and coverage by hotel and room class.", question: "Where is service slipping?", who: "GMs, operations",
    kpis: ["Average rating", "Rating coverage %", "Share of 1–2 ratings"], visuals: ["Rating by hotel", "Distribution histogram", "Coverage card"], filters: "City, hotel, room class",
    build: ["AVERAGE skips blanks", "Show COUNT of ratings next to the average", "Flag hotels with low coverage"], proxima: "3.62/5 on 56,683 rated bookings (42.1%).", page: "04 Channel, Room & Guest" },
  { name: "Weekly Trend (WoW)", tool: "Power BI", tag: "Is this week better than last?", context: "The Monday-morning revenue meeting view.",
    what: "Revenue, occupancy, ADR, RevPAR, realisation and DSRN with week-over-week change.", question: "What moved since last week, and why?", who: "Revenue managers, GMs",
    kpis: ["Revenue WoW %", "Occupancy WoW %", "ADR WoW %", "RevPAR WoW %"], visuals: ["Week line charts", "WoW cards with arrows"], filters: "Week, city",
    build: ["wn calculated column in dim_date", "Measures with CALCULATE(…, dim_date[wn] = selected − 1)", "Handle week 1 (no prior week)"], proxima: "The register has six WoW measures.", page: "01 Overview" },
  { name: "Booking Pace", tool: "Power BI", tag: "How is next month shaping up?", context: "Forward-looking RM view.",
    what: "Bookings on the books for future dates vs the same lead time last period.", question: "Are we ahead or behind for upcoming dates?", who: "Revenue managers",
    kpis: ["On-the-books room nights", "Pace vs last year", "Pickup"], visuals: ["Pace curve by days before arrival", "Pickup table"], filters: "Hotel, arrival month",
    build: ["Needs booking_date snapshots or a longer history", "Lead time = check_in_date − booking_date", "Extension beyond this dataset's 92 days"], proxima: "Extension idea: 92 days is too short for year-on-year pace.", page: "Extension" },
  { name: "Loyalty & Guest Segments", tool: "Power BI", tag: "Are loyalty members more valuable?", context: "Marketing and CRM teams.",
    what: "Revenue, ADR, cancellation and rating for loyalty vs non-loyalty guests, by country and age.", question: "Should we invest more in loyalty?", who: "Marketing, CRM",
    kpis: ["Revenue per guest", "Cancellation % by segment", "Repeat stays"], visuals: ["Segment comparison bars", "Country map"], filters: "Segment, country",
    build: ["Uses the undocumented columns: is_loyalty_member, country, customer_age", "Validate them first (they're not in the metadata)", "Compare per guest, not total"], proxima: "Possible because fact_bookings has 10 extra columns.", page: "Extension" },
  { name: "Data Quality Monitor", tool: "Power BI", tag: "Can we trust today's numbers?", context: "A page every BI project should have.",
    what: "Row counts, composite-key duplicates, rating coverage, 'others' share and revenue-logic checks over time.", question: "Is the data good enough to report today?", who: "BI team, revenue manager",
    kpis: ["Expected vs actual rows (9,200)", "Duplicate keys", "Rating coverage", "'others' share"], visuals: ["Issue cards", "Trend per issue"], filters: "Table, hotel",
    build: ["One SQL check per rule (QA page)", "Snapshot the counts each refresh", "Alert when a count changes"], proxima: "9,200 rows expected; 'others' 40.9%; 37,728 unrated stays.", page: "QA & Reconciliation" },
];
/* ============================================================
   Helpers
   ============================================================ */
const CHART_COLORS = ["#1677D2", "#F59E0B", "#22C3EE", "#7C3AED", "#16A34A", "#DC2626", "#5B6472", "#0EA5E9"];
function el(tag, cls, html) { const e = document.createElement(tag); if (cls) e.className = cls; if (html !== undefined) e.innerHTML = html; return e; }
function esc(s) { return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;"); }
function slugify(s) { return String(s).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "").slice(0, 60); }
function copyText(text, btn, label) {
  const done = () => { if (btn) { const o = label || btn.textContent; btn.textContent = "✓ Copied"; setTimeout(() => { btn.textContent = o; }, 1500); } };
  if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(text).then(done).catch(() => fallbackCopy(text, done));
  else fallbackCopy(text, done);
}
function fallbackCopy(text, cb) {
  const ta = document.createElement("textarea"); ta.value = text; ta.style.position = "fixed"; ta.style.opacity = "0";
  document.body.appendChild(ta); ta.select(); try { document.execCommand("copy"); } catch (e) {} ta.remove(); if (cb) cb();
}

/* ---------------- Storage (never throws) ---------------- */
const STORE_KEY = "shodwe_hub_state_v1";
let __memState = null;
function loadState() {
  let s = null;
  try { s = JSON.parse(localStorage.getItem(STORE_KEY)); } catch (e) {}
  if (!s) s = __memState;
  s = s || {};
  ["journey", "deliv", "assign", "lab", "qa", "qachk", "recon", "pitch"].forEach(k => { if (!s[k]) s[k] = {}; });
  return s;
}
function saveState(s) { __memState = s; try { localStorage.setItem(STORE_KEY, JSON.stringify(s)); } catch (e) {} }
function lsGet(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }
function lsSet(k, v) { try { localStorage.setItem(k, v); } catch (e) {} }

/* ---------------- Charts (native SVG / CSS) ---------------- */
function svgDonut(data, size) {
  size = size || 120;
  const total = data.reduce((s, d) => s + Math.abs(d[1]), 0);
  const r = size / 2 - 10, cx = size / 2, cy = size / 2, C = 2 * Math.PI * r;
  let off = 0, circles = "";
  data.forEach((d, i) => {
    const dash = total ? (Math.abs(d[1]) / total) * C : 0;
    circles += `<circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="${CHART_COLORS[i % CHART_COLORS.length]}" stroke-width="16" stroke-dasharray="${dash} ${C - dash}" stroke-dashoffset="${-off}" transform="rotate(-90 ${cx} ${cy})"/>`;
    off += dash;
  });
  return `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" role="img">${circles}</svg>`;
}
function renderDonutBlock(chart) {
  const data = chart.data || [];
  const total = data.reduce((s, d) => s + d[1], 0);
  const legend = data.map((d, i) => `<div class="li"><span class="sw" style="background:${CHART_COLORS[i % CHART_COLORS.length]}"></span>${esc(d[0])}: ${Number(d[1]).toLocaleString("en-IN")} (${total ? ((d[1] / total) * 100).toFixed(1) : "0.0"}%)</div>`).join("");
  return `<div class="mock-chart"><div class="ct">${esc(chart.title)}</div><div class="donut-wrap">${svgDonut(data)}<div class="mock-legend">${legend}</div></div></div>`;
}
function renderBarBlock(chart, opts) {
  const data = chart.data || [];
  const max = Math.max(...data.map(d => Math.abs(d[1])), 0);
  const suffix = chart.suffix || "", prefix = chart.prefix || "";
  const base = opts && opts.base;
  const rows = data.map((d, i) => {
    const pct = max ? (Math.abs(d[1]) / max) * 100 : 0;
    const hiC = opts && opts.goodHigh ? "#16A34A" : "#DC2626", loC = opts && opts.goodHigh ? "#DC2626" : "#16A34A";
    const color = base !== undefined ? (d[1] > base * 1.15 ? hiC : d[1] < base * 0.85 ? loC : "#1677D2") : (d[1] < 0 ? "#DC2626" : CHART_COLORS[i % CHART_COLORS.length]);
    const extra = d[2] !== undefined ? ` <span style="color:var(--ink-muted);font-size:10.5px;">n=${d[2]}</span>` : "";
    return `<div class="bar-row"><div class="lab">${esc(d[0])}</div><div class="track"><div class="fill" style="width:${pct}%;background:${color}"></div></div><div class="val">${prefix}${Number(d[1]).toLocaleString("en-IN")}${suffix}${extra}</div></div>`;
  }).join("");
  return `<div class="mock-chart"><div class="ct">${esc(chart.title)}</div>${rows}</div>`;
}
function renderDashMock(d) {
  const kpis = d.kpis.map(k => `<div class="mock-kpi"><div class="v">${k.v}</div><div class="l">${esc(k.l)}</div></div>`).join("");
  const donuts = (d.donuts || []).map(c => renderDonutBlock(c)).join("");
  const bars = (d.bars || []).map(c => renderBarBlock(c)).join("");
  return `<div class="card dash-mock"><div class="mock-head"><h4>${esc(d.title)}</h4><p>${esc(d.sub)}</p></div><div class="mock-kpis">${kpis}</div><div class="mock-charts">${donuts}${bars}</div></div>`;
}

/* ============================================================
   Progress engine
   ============================================================ */
const TRACKS = [
  { id: "business", name: "Business Understanding" }, { id: "model", name: "Data Model & Quality" }, { id: "sql", name: "SQL" },
  { id: "kpi", name: "KPIs" }, { id: "excel", name: "Excel" }, { id: "tableau", name: "Tableau" }, { id: "powerbi", name: "Power BI" },
  { id: "qa", name: "QA" }, { id: "interview", name: "Interview" }, { id: "career", name: "Insights & Career" },
];
function trackScores() {
  const s = loadState();
  const sc = {}; TRACKS.forEach(t => sc[t.id] = [0, 0]);
  JOURNEY.forEach(j => { sc[j.track][1]++; if (s.journey[j.id]) sc[j.track][0]++; });
  DELIVERABLES.forEach(d => { sc[d.track][1]++; if (s.deliv[d.id]) sc[d.track][0]++; });
  assignments().forEach(a => { sc[a.track][1]++; if (s.assign[a.id] && s.assign[a.id].ok) sc[a.track][0]++; });
  const qaDone = QA.filter(q => s.qa[q.cat + "::" + q.q]).length;
  sc.interview[1] += 6; sc.interview[0] += 6 * (QA.length ? qaDone / QA.length : 0);
  sc.interview[1] += 1; if (s.pitch.practiced) sc.interview[0] += 1;
  const labDone = Object.keys(s.lab).length;
  sc.interview[1] += 3; sc.interview[0] += 3 * Math.min(1, labDone / LAB.length);
  const chk = QA_CHECKLIST.filter(c => s.qachk[c.id]).length;
  sc.qa[1] += 3; sc.qa[0] += 3 * (chk / QA_CHECKLIST.length);
  const out = TRACKS.map(t => ({ ...t, pct: sc[t.id][1] ? Math.round((sc[t.id][0] / sc[t.id][1]) * 100) : 0 }));
  const overall = Math.round(out.reduce((a, t) => a + t.pct, 0) / out.length);
  return { tracks: out, overall, qaDone, labDone };
}
function refreshProgress() {
  const { tracks, overall, qaDone } = trackScores();
  const fill = document.getElementById("sidebar-progress-fill"), cap = document.getElementById("sidebar-progress-caption");
  if (fill) fill.style.width = overall + "%";
  if (cap) cap.textContent = `${overall}% project complete · ${qaDone}/${QA.length} interview Qs`;
  const hp = document.getElementById("home-progress");
  if (hp) {
    const top = tracks.slice().sort((a, b) => b.pct - a.pct);
    hp.innerHTML = `<h4>Your Progress</h4><div class="big">${overall}%</div><div class="sub">overall project completion</div>
      <div class="track-list">${tracks.slice(0, 5).map(trackRow).join("")}</div>
      <button class="btn-outline" style="margin-top:14px;padding:8px 14px;" data-goto="progress">See full progress →</button>`;
    hp.querySelector("[data-goto]").addEventListener("click", () => switchView("progress"));
  }
  try { renderCertificate(); } catch (e) {}
  const po = document.getElementById("progress-overall");
  if (po) po.innerHTML = `<h4>Overall Progress</h4><div class="big">${overall}%</div><div class="sub">Average of the ten skill tracks below</div>`;
  const tl = document.getElementById("track-list");
  if (tl) tl.innerHTML = tracks.map(trackRow).join("");
  const todo = document.getElementById("progress-todo");
  if (todo) {
    const s = loadState();
    const openJ = JOURNEY.filter(j => !s.journey[j.id]);
    const openD = DELIVERABLES.filter(d => !s.deliv[d.id]);
    const openA = assignments().filter(a => !(s.assign[a.id] && s.assign[a.id].ok));
    const li = (arr, f) => arr.length ? arr.map(f).join("") : `<div style="padding:4px 0;">✓ All done</div>`;
    todo.innerHTML = `<h5 style="margin:0 0 6px;font-size:13px;color:var(--ink);">Journey steps (${openJ.length} open)</h5>${li(openJ.slice(0, 5), j => `<div style="padding:3px 0;">• <a href="#" data-go="${j.go}">${esc(j.t)}</a></div>`)}
      <h5 style="margin:14px 0 6px;font-size:13px;color:var(--ink);">Deliverables (${openD.length} open)</h5>${li(openD.slice(0, 6), d => `<div style="padding:3px 0;">• ${esc(d.t)}</div>`)}
      <h5 style="margin:14px 0 6px;font-size:13px;color:var(--ink);">Assignments (${openA.length} open)</h5>${li(openA.slice(0, 6), a => `<div style="padding:3px 0;">• ${esc(a.t)}</div>`)}`;
    todo.querySelectorAll("[data-go]").forEach(a => a.addEventListener("click", (e) => { e.preventDefault(); switchView(a.dataset.go); }));
  }
}
function trackRow(t) {
  return `<div class="track-row ${t.pct >= 100 ? "complete" : ""}"><div class="tl">${esc(t.name)}</div><div class="tb"><div class="tf" style="width:${t.pct}%"></div></div><div class="tv">${t.pct}%</div></div>`;
}

/* ============================================================
   Home
   ============================================================ */
function renderStats() {
  const wrap = document.getElementById("stat-strip");
  wrap.innerHTML = STATS.map(s => `<div class="stat"><div class="num">${s.num}</div><div class="lbl">${esc(s.lbl)}</div></div>`).join("");
}
function renderJourney() {
  const wrap = document.getElementById("journey"); const s = loadState();
  wrap.innerHTML = JOURNEY.map((j, i) => `
    ${i ? '<div class="journey-arrow">↓</div>' : ""}
    <div class="journey-step ${s.journey[j.id] ? "done" : ""}">
      <div class="jn">${String(i + 1).padStart(2, "0")}</div>
      <div><h4>${esc(j.t)}</h4><p>${esc(j.d)}</p></div>
      <div class="journey-actions">
        <button class="check-pill ${s.journey[j.id] ? "on" : ""}" data-j="${j.id}">${s.journey[j.id] ? "✓ Done" : "Mark done"}</button>
        <button class="start-btn" data-go="${j.go}">Start →</button>
      </div>
    </div>`).join("");
  wrap.querySelectorAll("[data-go]").forEach(b => b.addEventListener("click", () => switchView(b.dataset.go)));
  wrap.querySelectorAll("[data-j]").forEach(b => b.addEventListener("click", () => {
    const st = loadState(); st.journey[b.dataset.j] = !st.journey[b.dataset.j]; saveState(st); renderJourney(); refreshProgress();
  }));
}
function renderChecklist(containerId, items, bucket) {
  const wrap = document.getElementById(containerId); if (!wrap) return;
  const s = loadState();
  wrap.innerHTML = items.map(d => `
    <div class="deliv-item ${s[bucket][d.id] ? "on" : ""}" data-id="${d.id}" role="checkbox" aria-checked="${!!s[bucket][d.id]}" tabindex="0">
      <div class="box">${s[bucket][d.id] ? "✓" : ""}</div>
      <div><h4>${esc(d.t)}</h4><p>${esc(d.d)}</p>${d.where ? `<div class="where">→ ${esc(d.where)}</div>` : ""}</div>
    </div>`).join("");
  wrap.querySelectorAll(".deliv-item").forEach(it => {
    const toggle = () => { const st = loadState(); st[bucket][it.dataset.id] = !st[bucket][it.dataset.id]; saveState(st); renderChecklist(containerId, items, bucket); refreshProgress(); };
    it.addEventListener("click", toggle);
    it.addEventListener("keydown", (e) => { if (e.key === " " || e.key === "Enter") { e.preventDefault(); toggle(); } });
  });
}
function renderBeforeAfter() {
  const html = `
    <div class="ba-col ba-before"><h4>❌ Before analytics</h4><ul>${BEFORE_AFTER.before.map(x => `<li>${esc(x)}</li>`).join("")}</ul></div>
    <div class="ba-mid">→</div>
    <div class="ba-col ba-after"><h4>✅ After analytics</h4><div class="ba-flow">${BEFORE_AFTER.after.map((x, i) => `${i ? '<div class="dn">↓</div>' : ""}<div class="node">${esc(x)}</div>`).join("")}</div></div>`;
  ["before-after", "before-after-2"].forEach(id => { const w = document.getElementById(id); if (w) w.innerHTML = html; });
}
function renderTools() {
  const wrap = document.getElementById("tool-grid");
  TOOLS.forEach((t, i) => {
    wrap.appendChild(el("div", "card tool-card", `<img class="tool-logo" src="${t.logo}" alt="${t.name} logo"><h4>${t.name}</h4><div class="role">${t.role}</div><p>${t.desc}</p>`));
    if (i < TOOLS.length - 1) wrap.appendChild(el("div", "tool-arrow", "→"));
  });
}
function renderDomainPrimer() {
  document.getElementById("domain-what").textContent = DOMAIN_WHAT;
  document.getElementById("domain-where").innerHTML = DOMAIN_WHERE.map(x => `<div style="padding:5px 0;">• ${esc(x)}</div>`).join("");
  document.getElementById("domain-data").innerHTML = DOMAIN_DATA_TYPES.map(x => `<span>${esc(x)}</span>`).join("");
}
function renderResourceCards(items, containerId) {
  const wrap = document.getElementById(containerId); if (!wrap) return;
  wrap.innerHTML = "";
  items.forEach(d => {
    const action = d.type === "download"
      ? `<a class="doc-download" href="${d.href}" download="${d.filename}" title="Download ${d.name}">⬇</a>`
      : `<a class="doc-download" href="${d.href}" target="_blank" rel="noopener" title="Open ${d.name}">↗</a>`;
    wrap.appendChild(el("div", "card doc-card", `<div class="doc-icon">${d.icon}</div><div class="doc-info"><h4>${esc(d.name)}</h4><p>${esc(d.desc)}</p></div>${action}`));
  });
}
function renderDocuments() {
  renderResourceCards(SOFTWARE_LINKS, "software-grid");
  renderResourceCards(DOCUMENTS, "doc-grid");
  renderResourceCards(DOCUMENTS, "doc-grid-2");
  const ss = document.getElementById("setup-steps");
  if (ss) ss.innerHTML = SETUP_STEPS.map((s, i) => `<div class="card setup-step"><div class="si">${s.i}</div><div class="sn">STEP ${i + 1}</div><h4>${esc(s.t)}</h4><p>${esc(s.d)}</p></div>`).join("");
}
function renderFlow() {
  document.getElementById("flow-grid").innerHTML = FLOW.map((f, i) => `<div class="flow-step"><div class="idx">${String(i + 1).padStart(2, "0")}</div><h4>${esc(f.t)}</h4><p>${esc(f.d)}</p></div>`).join("");
}
function renderTimeline() {
  document.getElementById("timeline").innerHTML = TIMELINE.map(r => `<div class="timeline-row"><div class="d">${r.d}</div><div class="t">${r.t}</div><div>${esc(r.task)}</div></div>`).join("");
}

/* ============================================================
   Business problem
   ============================================================ */
function renderProblem() {
  const pg = document.getElementById("problem-grid");
  pg.innerHTML = PROBLEM_STATEMENT.map(r => `<div class="card rule-card"><div class="head"><div class="icon-badge">${r.icon}</div><h4>${esc(r.h)}</h4></div><p>${esc(r.p)}</p></div>`).join("");
  const list = document.getElementById("bq-list");
  list.innerHTML = bq().map((b, i) => `
    <div class="bq-item ${i === 0 ? "open" : ""}">
      <div class="bq-head"><span class="bqn">Q${i + 1}</span><h4>${esc(b.q)}</h4><span class="chev">⌄</span></div>
      <div class="bq-body"><div class="chain">
        <div class="chain-step"><div class="cl">Question</div><p>${esc(b.q)}</p></div>
        <div class="chain-step"><div class="cl">Data</div><p>${esc(b.data)}</p></div>
        <div class="chain-step"><div class="cl">KPI</div><p>${esc(b.kpi)}</p></div>
        <div class="chain-step"><div class="cl">Analysis</div><p>${esc(b.analysis)}</p></div>
        <div class="chain-step"><div class="cl">Insight</div><p>${esc(b.insight)}</p></div>
        <div class="chain-step rec"><div class="cl">Recommendation</div><p>${esc(b.rec)}</p></div>
      </div></div>
    </div>`).join("");
  list.querySelectorAll(".bq-head").forEach(h => h.addEventListener("click", () => h.parentElement.classList.toggle("open")));
  document.getElementById("req-table").innerHTML = `<thead><tr><th>Req</th><th>Page / Area</th><th>Stakeholder</th><th>What it must answer</th><th>Priority</th></tr></thead>
    <tbody>${REQUIREMENTS.map(r => `<tr>${r.map(c => `<td>${esc(c)}</td>`).join("")}</tr>`).join("")}</tbody>`;
}
function renderRules() {
  document.getElementById("rule-grid").innerHTML = RULES.map(r => `<div class="card rule-card ${r.ok ? "ok" : ""}"><div class="head"><div class="icon-badge">${r.icon}</div><h4>${esc(r.h)}</h4></div><p>${esc(r.p)}</p></div>`).join("");
  document.getElementById("focus-grid").innerHTML = FOCUS_AREAS.map(f => `<div class="card tip-card"><h4 style="margin-top:0;">${esc(f.h)}</h4><p>${esc(f.p)}</p></div>`).join("");
}

/* ============================================================
   Data pages
   ============================================================ */
function renderDataset() {
  document.getElementById("coverage-text").textContent = COVERAGE_TEXT;
  const rows = {}; Object.keys(TABLE_SRC).forEach(t => rows[t] = (HOSP.rows || {})[TABLE_SRC[t]]);
  document.getElementById("ds-grid").innerHTML = Object.keys(TABLE_TYPES).map(t => {
    const ty = TABLE_TYPES[t]; const cls = ty === "Dimension" ? "dim" : "fact";
    const pu = TABLE_PURPOSE[t] || ["", ""];
    return `<div class="card ds-card ${cls}"><div class="k">${esc(ty)}</div><h4>${t}</h4><div class="rows">${Number(rows[t] || 0).toLocaleString("en-IN")} rows</div>
      <dl class="ds-meta"><dt>Grain</dt><dd>${esc(TABLE_GRAIN[t])}</dd><dt>PK</dt><dd><code>${TABLE_PK[t]}</code></dd><dt>FK</dt><dd>${esc(TABLE_FK[t] || "—")}</dd><dt>Date</dt><dd>${esc(TABLE_DATE[t] || "—")}</dd><dt>Purpose</dt><dd>${esc(pu[0])}</dd></dl>
      <details class="ds-why"><summary>Why does this table exist?</summary><p>${esc(pu[1])}</p></details></div>`;
  }).join("");
  document.getElementById("story-table").innerHTML = `<thead><tr><th>When</th><th>Event</th><th>What happened</th><th>Where you'll see it</th></tr></thead>
    <tbody>${STORY.map(r => `<tr>${r.map(c => `<td>${esc(c)}</td>`).join("")}</tr>`).join("")}</tbody>`;
}
function renderModel() {
  const rows = {}; Object.keys(TABLE_SRC).forEach(t => rows[t] = (HOSP.rows || {})[TABLE_SRC[t]]);
  document.getElementById("schema-grid").innerHTML = Object.keys(TABLE_TYPES).map(t => {
    const ty = TABLE_TYPES[t]; const isFact = ty.startsWith("Fact");
    return `<div class="table-node ${isFact ? "fact" : ""} ${t === "fact_bookings" ? "center" : ""}"><div class="hd"><span>${t}</span><span>${Number(rows[t] || 0).toLocaleString("en-IN")}</span></div>
      <div class="bd"><div><span class="pk">${TABLE_PK[t]}</span> · PK</div><div>FK: ${TABLE_FK[t] || "—"}</div><div style="margin-top:4px;opacity:.85;">${ty}</div></div></div>`;
  }).join("");
  const rel = document.getElementById("rel-list");
  rel.innerHTML = `<h4 style="font-size:15px;margin-bottom:6px;">Relationships</h4>` + RELATIONSHIPS.map(r => `<div class="r"><span class="card-arrow">↳</span><span>${esc(r)}</span></div>`).join("");
  document.getElementById("load-order").innerHTML = LOAD_ORDER.map(x => `<div style="padding:5px 0;">${esc(x)}</div>`).join("");
  document.getElementById("calc-fields").innerHTML = CALC_FIELDS.map(x => `<div style="padding:5px 0;">• ${esc(x)}</div>`).join("");
  document.getElementById("gotchas-list").innerHTML = GOTCHAS.map(g => `<div class="gotcha-card"><div class="gotcha-title">⚠️ ${esc(g.t)}</div><div class="gotcha-desc">${esc(g.d)}</div></div>`).join("");
  document.getElementById("global-filters").innerHTML = GLOBAL_FILTERS.map(([n, src]) =>
    `<div style="display:flex;justify-content:space-between;gap:16px;padding:7px 0;border-top:1px solid var(--line-soft);"><span style="font-weight:600;color:var(--ink);">${esc(n)}</span><span style="font-family:var(--mono);font-size:12px;">${esc(src)}</span></div>`).join("");
  document.getElementById("join-guide-table").innerHTML = `<thead><tr><th>Type</th><th>Table</th><th>Primary Key</th><th>Foreign Keys</th><th>Grain</th><th>Rows</th></tr></thead>
    <tbody>${Object.keys(TABLE_TYPES).map(t => `<tr><td>${esc(TABLE_TYPES[t])}</td><td><code>${t}</code></td><td>${TABLE_PK[t]}</td><td>${TABLE_FK[t] || "—"}</td><td>${esc(TABLE_GRAIN[t])}</td><td class="num">${Number(rows[t] || 0).toLocaleString("en-IN")}</td></tr>`).join("")}</tbody>`;
  document.getElementById("dash-table").innerHTML = `<thead><tr><th>#</th><th>Page</th><th>Audience</th><th>Primary KPIs</th><th>Key visuals</th></tr></thead>
    <tbody>${DASHBOARDS.map(r => `<tr>${r.map(c => `<td>${esc(c)}</td>`).join("")}</tr>`).join("")}</tbody>`;
  const jp = document.getElementById("join-paths-table");
  if (jp) jp.innerHTML = `<thead><tr><th>Analysis</th><th>Join condition</th></tr></thead><tbody>${M_JOIN_PATHS.map(([a, b]) => `<tr><td>${esc(a)}</td><td><code>${esc(b)}</code></td></tr>`).join("")}</tbody>`;
  const img = document.getElementById("model-img");
  if (img) img.addEventListener("click", () => openModal(`<img class="zoom-img" src="${img.src}" alt="${esc(img.alt)}">`));
}
let ddKind = "All";
function renderDataDictionary(filterText) {
  const wrap = document.getElementById("datadict-tables"); if (!wrap) return;
  const q = (filterText !== undefined ? filterText : (document.getElementById("dd-search") || {}).value || "").trim().toLowerCase();
  const pills = document.getElementById("dd-pills");
  if (pills && !pills.children.length) {
    ["All", "Fact", "Dimension"].forEach(k => {
      const b = el("button", "pill" + (k === ddKind ? " active" : ""), k);
      b.dataset.k = k;
      b.addEventListener("click", () => { ddKind = k; pills.querySelectorAll(".pill").forEach(p => p.classList.toggle("active", p.dataset.k === k)); renderDataDictionary(); });
      pills.appendChild(b);
    });
  }
  wrap.innerHTML = "";
  M_DATA_DICTIONARY.forEach(t => {
    const kind = /^fact/.test(t.table) ? "Fact" : "Dimension";
    if (ddKind !== "All" && kind !== ddKind) return;
    const rows = t.cols.filter(c => !q || (t.table + " " + c.join(" ")).toLowerCase().includes(q));
    if (!rows.length) return;
    const card = el("div", "card dd-table-card table-scroll");
    card.innerHTML = `<div class="hd"><h4>${t.table}</h4><span class="tag p2">${esc(t.rows)}</span></div>
      <table class="dtable"><thead><tr><th>Column</th><th>Type</th><th>Description</th><th>Example / blanks</th></tr></thead>
      <tbody>${rows.map(([c, ty, d, n]) => `<tr><td><code>${esc(c)}</code></td><td><span class="col-type">${ty}</span></td><td>${esc(d)}</td><td>${esc(n)}</td></tr>`).join("")}</tbody></table>`;
    wrap.appendChild(card);
  });
  if (!wrap.children.length) wrap.appendChild(el("div", "empty-state", "No columns match that search."));
}
function renderQuality() {
  document.getElementById("null-notes").innerHTML = NULL_NOTES.map(x => `<div style="padding:6px 0;border-top:1px solid var(--line-soft);">• ${esc(x)}</div>`).join("");
  document.getElementById("dq-table").innerHTML = `<thead><tr><th>Check</th><th>Rule</th><th>Tables</th><th>Severity</th></tr></thead>
    <tbody>${DQ_RULES.map(r => `<tr>${r.map(c => `<td>${esc(c)}</td>`).join("")}</tr>`).join("")}</tbody>`;
}

/* ============================================================
   KPI Library
   ============================================================ */
let kpiActiveCat = "All", kpiSearch = "", kpiStarredOnly = false, kpiTier = "All";
function renderKpiTiers() {
  ["P1", "P2", "P3"].forEach(p => { const e = document.getElementById("kr-" + p.toLowerCase()); if (e) e.textContent = KPIS.filter(k => k.prio === p).length + " KPIs"; });
  const w = document.getElementById("kpi-tier-pills"); if (!w) return; w.innerHTML = "";
  [["All", "All tiers"], ["P1", "P1 · Must know"], ["P2", "P2 · Important"], ["P3", "P3 · Advanced"]].forEach(([v, l]) => {
    const b = el("button", "pill" + (v === kpiTier ? " active" : ""), l); b.addEventListener("click", () => { kpiTier = v; renderKpiTiers(); renderKpiGrid(); }); w.appendChild(b);
  });
}
function renderKpiPills() {
  const wrap = document.getElementById("kpi-pills"); wrap.innerHTML = "";
  KPI_CATS.forEach(c => {
    const n = c === "All" ? KPIS.length : KPIS.filter(k => k.cat === c).length;
    const b = el("button", "pill" + (c === kpiActiveCat ? " active" : ""), `${c} (${n})`);
    b.addEventListener("click", () => { kpiActiveCat = c; renderKpiPills(); renderKpiGrid(); });
    wrap.appendChild(b);
  });
}
function renderKpiGrid() {
  const wrap = document.getElementById("kpi-grid"); wrap.innerHTML = "";
  const q = kpiSearch.trim().toLowerCase(); const bm = getBookmarks();
  const list = KPIS.filter(k => (kpiTier === "All" || k.prio === kpiTier) && (kpiActiveCat === "All" || k.cat === kpiActiveCat) && (!q || (k.name + k.q + k.desc + k.formula + k.table + k.dax).toLowerCase().includes(q)) && (!kpiStarredOnly || bm.kpi[k.name]));
  if (!list.length) { wrap.appendChild(el("div", "empty-state", kpiStarredOnly ? "No starred KPIs yet. Tap the ★ on any card to save it here." : "No KPIs match that search.")); return; }
  list.forEach(k => {
    const starred = !!bm.kpi[k.name];
    const c = el("div", "card kpi-card"); c.id = "kpi-" + slugify(k.name);
    c.innerHTML = `
      <div class="top"><h4>${esc(k.name)}</h4>
        <div class="card-top-actions"><span class="tag ${k.prio === "P1" ? "p1" : "p2"} tier-${k.prio}">${k.prio}</span>
          <button class="link-btn" title="Copy link to this KPI" data-link-kpi="${esc(k.name)}">🔗</button>
          <button class="star-btn ${starred ? "starred" : ""}" title="Star this KPI" data-star-kpi="${esc(k.name)}">${starred ? "★" : "☆"}</button></div></div>
      <p class="kpi-q">${esc(k.q)}</p>
      <p class="kpi-logic">${esc(k.desc)}</p>
      <div class="kpi-plain">${esc(k.plain)}</div>
      <div class="formula">${esc(k.formula)}</div>
      ${k.dax ? `<div class="formula dax">${esc(k.dax)}</div>` : ""}
      <div class="kpi-ans"><span>Answer key (2015): ${esc(k.v25)}</span>${k.wrong ? `<span class="bm">⚠ Wrong: ${esc(k.wrong)}</span>` : ""}</div>
      <div class="meta"><span>${esc(k.table)}</span><span>${esc(k.cat)} · ${esc(k.dir)}</span></div>`;
    wrap.appendChild(c);
  });
  wrap.querySelectorAll("[data-star-kpi]").forEach(b => b.addEventListener("click", () => { toggleBookmark("kpi", b.dataset.starKpi); renderKpiGrid(); }));
  wrap.querySelectorAll("[data-link-kpi]").forEach(b => b.addEventListener("click", () => copyDeepLink("kpi", b.dataset.linkKpi)));
}

/* ============================================================
   SQL, Excel, Analysis
   ============================================================ */
let sqlCat = "All", sqlPractice = false;
function sqlHint(sql) {
  const kw = (sql.match(/\b(SELECT|JOIN|LEFT JOIN|WHERE|GROUP BY|HAVING|ORDER BY|WITH|CASE|SUM|COUNT|AVG|DATEDIFF|ROW_NUMBER|RANK|COALESCE|COUNT_IF|IFF|TRY_TO_NUMBER|TO_DATE|COPY INTO|CREATE TABLE|CREATE OR REPLACE VIEW|UNION ALL)\b/gi) || []).map(x => x.toUpperCase());
  const tables = sql.match(/\b(fact_\w+|dim_\w+|vw_\w+)\b/g) || [];
  return `Tables: ${[...new Set(tables)].join(", ") || "—"} · Key SQL: ${[...new Set(kw)].slice(0, 8).join(", ")}`;
}
function sqlBlockHtml(b, idx, prefix) {
  const exp = (b.sql.match(/--\s*[^\n]*\d[^\n]*/g) || []).slice(0, 3).map(x => x.replace(/^--\s*/, "")).join(" · ");
  if (prefix === "s" && sqlPractice) {
    return `<div class="card sql-block practice"><div class="hd"><div><h4>${esc(b.title)}</h4><p><strong>Your task:</strong> ${esc(b.desc)}</p></div></div>
      ${exp ? `<div class="sql-expect">🎯 Expected result: ${esc(exp)}</div>` : ""}
      <div class="sql-steps"><button class="btn-outline" data-hint="${idx}">💡 Show hint</button><button class="btn-blue" data-reveal="${idx}">🔓 Reveal solution</button></div>
      <div class="hint-text" id="sqlh-${idx}" style="display:none;">${esc(sqlHint(b.sql))}</div>
      <pre id="sqls-${idx}" style="display:none;">${esc(b.sql)}</pre></div>`;
  }
  const lv = b.level || ({ Setup: "Easy", KPI: "Medium", Breakdown: "Medium", "Mart view": "Advanced" }[b.cat] || "Medium");
  return `<div class="card sql-block"><div class="hd"><div><h4><span class="lvl lvl-${lv.toLowerCase()}">${lv}</span> ${esc(b.title)}</h4><p>${esc(b.desc)}</p></div><button class="copy-btn" data-copy="${prefix}${idx}">Copy</button></div><pre>${esc(b.sql)}</pre></div>`;
}
function renderSql() {
  const pills = document.getElementById("sql-pills");
  const cats = ["All", ...new Set(SQL_BLOCKS.map(b => b.cat))];
  pills.innerHTML = "";
  cats.forEach(c => { const b = el("button", "pill" + (c === sqlCat ? " active" : ""), c); b.addEventListener("click", () => { sqlCat = c; renderSql(); }); pills.appendChild(b); });
  const wrap = document.getElementById("sql-list");
  wrap.innerHTML = SQL_BLOCKS.map((b, i) => (sqlCat === "All" || b.cat === sqlCat) ? sqlBlockHtml(b, i, "s") : "").join("");
  wrap.querySelectorAll("[data-copy]").forEach(btn => btn.addEventListener("click", () => copyText(SQL_BLOCKS[+btn.dataset.copy.slice(1)].sql, btn, "Copy")));
  wrap.querySelectorAll("[data-hint]").forEach(b => b.addEventListener("click", () => { const x = document.getElementById("sqlh-" + b.dataset.hint); x.style.display = x.style.display === "none" ? "block" : "none"; }));
  wrap.querySelectorAll("[data-reveal]").forEach(b => b.addEventListener("click", () => { document.getElementById("sqls-" + b.dataset.reveal).style.display = "block"; b.remove(); }));
  const t = document.getElementById("sql-practice-toggle");
  if (t && !t._bound) { t._bound = true; t.addEventListener("click", () => { sqlPractice = !sqlPractice; t.textContent = sqlPractice ? "Turn practice mode OFF" : "Turn practice mode ON"; renderSql(); }); }
}
function renderExcel() {
  document.getElementById("excel-table").innerHTML = `<thead><tr><th>Calculation</th><th>Excel formula pattern</th><th>Expected result</th><th>Status</th></tr></thead>
    <tbody>${EXCEL_TASKS.map(r => `<tr><td>${esc(r[0])}</td><td><code>${esc(r[1])}</code></td><td>${esc(r[2])}</td><td>${esc(r[3])}</td></tr>`).join("")}</tbody>`;
  document.getElementById("pivot-grid").innerHTML = PIVOTS.map(t => `<div class="card tip-card"><div class="n">${t.n}</div><h4>${esc(t.h)}</h4><p>${esc(t.p)}</p></div>`).join("");
}
function renderAnalysis() {
  document.getElementById("vol-base").textContent = f1(A.occ) + "%";
  const card = (t, sub, data, suffix) => `<div class="card chart-card"><h4>${esc(t)}</h4><div class="cs">${esc(sub)}</div>${renderBarBlock({ title: "", data: data || [], suffix: suffix || "" })}</div>`;
  document.getElementById("driver-grid").innerHTML =
      card("Booking outcomes (% of bookings)", `Only ${f1(A.real_pct)}% become a stay`, MD.status_pct, "%")
    + card("Daily room nights", "Sellable vs booked vs used", MD.daily)
    + card("Revenue share by city", `Mumbai alone = ${f1(A.mumbai_share)}%`, MD.city_share, "%")
    + card("Revenue per hotel by category ($M)", "Business out-earns Luxury per property", MD.cat_avg_m)
    + card("Booking % by platform (top 5)", "'others' is unidentified: fix tagging first", MD.platform_pct, "%")
    + card("Booking % by room class", "Elite leads", MD.room_pct, "%")
    + card("Rating coverage (bookings)", `${f1(A.unrated_co_pct)}% of completed stays left no rating`, MD.rating_cov);
  document.getElementById("insights-grid").innerHTML = bq().slice(0, 6).map((k, i) => `
    <div class="card insight-card tint-${i % 6}"><div class="insight-label">Insight</div><p class="insight-text">${esc(k.insight)}</p>
    <div class="insight-label rec">Recommendation</div><p class="insight-text">${esc(k.rec)}</p></div>`).join("");
}

/* ============================================================
   Dashboard gallery + modal
   ============================================================ */
function openModal(html) {
  document.getElementById("modal-body").innerHTML = html;
  document.getElementById("modal-overlay").classList.add("open");
}
function closeModal() { document.getElementById("modal-overlay").classList.remove("open"); }
function initModal() {
  const ov = document.getElementById("modal-overlay");
  document.getElementById("modal-close").addEventListener("click", closeModal);
  ov.addEventListener("click", (e) => { if (e.target === ov) closeModal(); });
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") closeModal(); });
}
function renderGallery() {
  const pages = galleryPages();
  document.getElementById("gallery-grid").innerHTML = pages.map((p, i) => `
    <div class="card gallery-card">
      <div class="gtop"><div class="gnum">${p.n}</div><h4>${esc(p.t)}</h4><div class="gk">${p.keys.map(k => `<span>${esc(k)}</span>`).join("")}</div></div>
      <div class="gbody"><div class="gq">❓ ${esc(p.q)}</div><p>${esc(p.desc)}</p><div class="gins">💡 ${esc(p.ins)}</div><div class="gaud">Audience: ${esc(p.aud)}</div><button class="btn-blue" data-dash="${i}">View Dashboard →</button></div>
    </div>`).join("");
  document.querySelectorAll("[data-dash]").forEach(b => b.addEventListener("click", () => {
    const p = pages[+b.dataset.dash];
    openModal(`<div class="flow-strip"><div><span>Business question</span>${esc(p.q)}</div><div><span>KPIs</span>${esc(p.keys.join(" · "))}</div><div><span>Key insight</span>${esc(p.ins)}</div><div><span>Interview question</span>${esc(p.iq)}</div></div>` + renderDashMock(p.mock) + `<div class="build-notes">
      <div class="card"><h5>📈 Build it in Tableau</h5><ul>${p.build.tableau.map(x => `<li>${esc(x)}</li>`).join("")}</ul></div>
      <div class="card"><h5>⚡ Build it in Power BI</h5><ul>${p.build.powerbi.map(x => `<li>${esc(x)}</li>`).join("")}</ul></div></div>`);
  }));
}

/* ============================================================
   QA page
   ============================================================ */
const RECON_KPIS = ["Revenue", "ADR (Average Daily Rate)", "RevPAR (Revenue Per Available Room)", "Realisation %", "Total Bookings", "Total Checked Out", "Total Cancelled Bookings", "Cancellation %", "Total No Show Bookings", "No Show Rate %", "Average Rating", "Occupancy %", "DBRN (Daily Booked Room Nights)", "DSRN (Daily Sellable Room Nights)", "DURN (Daily Utilized Room Nights)"];
function renderQA() {
  const wrap = document.getElementById("qa-sql-list");
  wrap.innerHTML = QA_SQL.map((b, i) => sqlBlockHtml(b, i, "q")).join("");
  wrap.querySelectorAll("[data-copy]").forEach(btn => btn.addEventListener("click", () => copyText(QA_SQL[+btn.dataset.copy.slice(1)].sql, btn, "Copy")));
  const s = loadState();
  const rows = RECON_KPIS.map(n => KPIS.find(k => k.name === n)).filter(Boolean);
  const t = document.getElementById("recon-table");
  t.innerHTML = `<thead><tr><th>KPI (answer key)</th><th>SQL / answer key</th><th>Your Tableau value</th><th>Your Power BI value</th><th>Status</th></tr></thead>
    <tbody>${rows.map(k => {
      const r = s.recon[k.id] || {};
      return `<tr data-id="${k.id}" data-ans="${esc(k.v25)}"><td>${esc(k.name)}</td><td class="num">${esc(k.v25)}</td>
        <td><input class="search-input" style="max-width:130px;padding:6px 10px;" data-f="tab" value="${esc(r.tab || "")}"></td>
        <td><input class="search-input" style="max-width:130px;padding:6px 10px;" data-f="pbi" value="${esc(r.pbi || "")}"></td>
        <td class="st"></td></tr>`;
    }).join("")}</tbody>`;
  const evalRow = (tr) => {
    const ansM = String(tr.dataset.ans).replace(/,/g, "").match(/-?\d+(\.\d+)?/); const ans = ansM ? parseFloat(ansM[0]) : NaN;
    const vals = [...tr.querySelectorAll("input")].map(i => i.value.trim());
    const ok = vals.map(v => v !== "" && Math.abs(parseFloat(v.replace(/[^0-9.\-]/g, "")) - ans) <= Math.max(0.011, Math.abs(ans) * 0.001));
    const st = tr.querySelector(".st");
    if (vals.every(v => v === "")) st.textContent = "";
    else if (ok.every(Boolean)) st.innerHTML = `<span class="recon-ok">✓ Ties out</span>`;
    else st.innerHTML = `<span style="color:var(--red);font-weight:700;">✗ Investigate</span>`;
  };
  t.querySelectorAll("tbody tr").forEach(tr => {
    evalRow(tr);
    tr.querySelectorAll("input").forEach(inp => inp.addEventListener("input", () => {
      const st = loadState(); st.recon[tr.dataset.id] = st.recon[tr.dataset.id] || {}; st.recon[tr.dataset.id][inp.dataset.f] = inp.value; saveState(st); evalRow(tr);
    }));
  });
  renderChecklist("qa-checklist", QA_CHECKLIST, "qachk");
}

/* ============================================================
   Assignments
   ============================================================ */
function renderAssignments() {
  const list = assignments(); const s = loadState();
  const done = list.filter(a => s.assign[a.id] && s.assign[a.id].ok).length;
  document.getElementById("assign-score").textContent = `${done} / ${list.length} assignments solved`;
  const wrap = document.getElementById("assign-list");
  wrap.innerHTML = list.map((a, i) => {
    const st = s.assign[a.id] || {};
    const input = a.type === "select"
      ? `<select data-in="${a.id}"><option value="">Choose…</option>${a.options.map(o => `<option ${st.last === o ? "selected" : ""}>${esc(o)}</option>`).join("")}</select>`
      : `<input type="text" inputmode="decimal" data-in="${a.id}" placeholder="Your answer${a.unit ? " (" + a.unit + ")" : ""}" value="${esc(st.last || "")}">`;
    return `<div class="card assign-card" id="as-${a.id}">
      <div class="assign-head"><span class="an">Assignment ${String(i + 1).padStart(2, "0")}</span><div><h4>${esc(a.t)}</h4><div class="tool">${esc(a.tool)}</div></div>
        <span class="status ${st.ok ? "ok" : ""}">${st.ok ? "✓ Solved" : st.tries ? `${st.tries} attempt${st.tries > 1 ? "s" : ""}` : "Not started"}</span></div>
      <div class="assign-steps"><button data-tab="task" class="active">1 · View Task</button><button data-tab="check">2 · Check Answer</button><button data-tab="sol">3 · Solution</button></div>
      <div class="assign-panel show" data-p="task"><strong>What to do</strong><ul>${a.task.map(x => `<li>${esc(x)}</li>`).join("")}</ul></div>
      <div class="assign-panel" data-p="check"><div class="answer-row">${input}<button class="btn-blue" data-check="${a.id}">Check</button><button class="btn-outline" data-hint="${a.id}">Hint</button></div>
        <div class="answer-feedback ${st.ok ? "good" : ""}">${st.ok ? "✓ Correct, and it matches the dataset." : ""}</div><div class="hint-text" style="display:none;">💡 ${esc(a.hint)}</div></div>
      <div class="assign-panel" data-p="sol">${st.tries ? `<pre>${esc(a.sol)}</pre>` : `<div class="hint-text">🔒 Make at least one attempt in <strong>Check Answer</strong> to unlock the solution.</div>`}</div>
    </div>`;
  }).join("");
  wrap.querySelectorAll(".assign-card").forEach(card => {
    card.querySelectorAll("[data-tab]").forEach(b => b.addEventListener("click", () => {
      card.querySelectorAll("[data-tab]").forEach(x => x.classList.toggle("active", x === b));
      card.querySelectorAll("[data-p]").forEach(p => p.classList.toggle("show", p.dataset.p === b.dataset.tab));
    }));
  });
  wrap.querySelectorAll("[data-hint]").forEach(b => b.addEventListener("click", () => { const h = b.closest(".assign-panel").querySelector(".hint-text"); h.style.display = h.style.display === "none" ? "block" : "none"; }));
  wrap.querySelectorAll("[data-check]").forEach(b => b.addEventListener("click", () => {
    const a = list.find(x => x.id === b.dataset.check);
    const inp = wrap.querySelector(`[data-in="${a.id}"]`); const raw = inp.value.trim();
    if (!raw) return;
    let ok;
    if (a.type === "select") ok = raw === a.ans;
    else { const v = parseFloat(raw.replace(/[₹,%\s]/g, "")); ok = !isNaN(v) && Math.abs(v - a.ans) <= (a.tol || 0) + 1e-9; }
    const st = loadState(); const cur = st.assign[a.id] || { tries: 0 };
    cur.tries = (cur.tries || 0) + 1; cur.last = raw; if (ok) cur.ok = true; st.assign[a.id] = cur; saveState(st);
    renderAssignments(); refreshProgress();
    const card = document.getElementById("as-" + a.id);
    card.querySelectorAll("[data-tab]").forEach(x => x.classList.toggle("active", x.dataset.tab === "check"));
    card.querySelectorAll("[data-p]").forEach(p => p.classList.toggle("show", p.dataset.p === "check"));
    const fb = card.querySelector(".answer-feedback");
    fb.className = "answer-feedback " + (ok ? "good" : "bad");
    fb.textContent = ok ? "✓ Correct, and it matches the dataset." : "✗ Not quite. Re-check your filters (dates, status, denominator), use the hint, or open the solution.";
  }));
}

/* ============================================================
   Analyst Thinking Lab
   ============================================================ */
function renderLab() {
  const s = loadState();
  const answered = Object.keys(s.lab).length;
  const best = Object.entries(s.lab).filter(([i, c]) => LAB[+i] && LAB[+i].opts[c] && LAB[+i].opts[c][1] === "best").length;
  document.getElementById("lab-score").textContent = `${answered} / ${LAB.length} scenarios answered · ${best} best-first-move picks`;
  const wrap = document.getElementById("lab-list");
  wrap.innerHTML = LAB.map((l, i) => {
    const pick = s.lab[i];
    return `<div class="card lab-card"><div class="lab-n">Scenario ${String(i + 1).padStart(2, "0")}</div><h4>${esc(l.t)}</h4><p class="scn">${esc(l.scn)}</p>
      <div class="lab-opts">${l.opts.map((o, j) => `<button class="lab-opt ${pick !== undefined ? o[1] : ""}" data-l="${i}" data-o="${j}">${"ABCD"[j]}. ${esc(o[0])}${pick !== undefined ? (o[1] === "best" ? " ✓ best first move" : o[1] === "ok" ? " · reasonable, not first" : "") : ""}${pick === j ? " ← your pick" : ""}</button>`).join("")}</div>
      <div class="lab-explain ${pick !== undefined ? "show" : ""}"><strong>What an analyst checks first:</strong><ol>${l.exp.map(x => `<li>${esc(x)}</li>`).join("")}</ol></div></div>`;
  }).join("");
  wrap.querySelectorAll("[data-l]").forEach(b => b.addEventListener("click", () => {
    const st = loadState(); st.lab[b.dataset.l] = +b.dataset.o; saveState(st); renderLab(); refreshProgress();
  }));
}

/* ============================================================
   Interview Q&A
   ============================================================ */
let qaActiveCat = "Explain This Project", qaSearch = "", qaStarredOnly = false;
function renderQaTabs() {
  const wrap = document.getElementById("qa-tabs"); wrap.innerHTML = "";
  QA_CATS.forEach(c => {
    const b = el("button", c === qaActiveCat ? "active" : "", `${c} (${QA.filter(q => q.cat === c).length})`);
    b.addEventListener("click", () => { qaActiveCat = c; renderQaTabs(); renderQaList(); });
    wrap.appendChild(b);
  });
}
function renderQaList() {
  const wrap = document.getElementById("qa-list"); wrap.innerHTML = "";
  const st = loadState(); const bm = getBookmarks(); const q = qaSearch.trim().toLowerCase();
  const list = QA.filter(it => (q ? true : it.cat === qaActiveCat) && (!q || (it.q + it.a).toLowerCase().includes(q)) && (!qaStarredOnly || bm.qa[it.q]));
  updateQaProgressBar();
  if (!list.length) { wrap.appendChild(el("div", "empty-state", qaStarredOnly ? "No starred questions yet. Tap the ★ on any question to save it here." : "No questions match that search.")); return; }
  list.forEach(item => {
    const id = item.cat + "::" + item.q; const done = !!st.qa[id]; const starred = !!bm.qa[item.q]; const isLong = item.a.length > 480;
    const card = el("div", "qa-item" + (done ? " reviewed" : "")); card.id = "qa-" + slugify(item.q);
    card.innerHTML = `
      <div class="qa-q"><span class="num">${esc(item.cat)}</span><span class="qtext">${esc(item.q)}</span>
        <button class="link-btn" title="Copy link to this question">🔗</button>
        <button class="star-btn ${starred ? "starred" : ""}" title="Star this question">${starred ? "★" : "☆"}</button><span class="chev">⌄</span></div>
      <div class="qa-a"><div class="qa-a-inner">
        <div class="answer-text ${isLong ? "clamped" : ""}"><p>${item.a}</p></div>
        ${isLong ? '<button type="button" class="show-full-btn">Show full answer ▾</button>' : ""}
        <div class="signal">Interviewer signal: ${esc(item.signal)}</div>
        ${item.src ? `<div class="q-src">📚 Source: <a href="${item.src[1]}" target="_blank" rel="noopener">${esc(item.src[0])} ↗</a></div>` : ""}
        <button class="mark-btn ${done ? "done" : ""}">${done ? "✓ Reviewed" : "Mark as reviewed"}</button></div></div>`;
    const aDiv = card.querySelector(".qa-a");
    card.querySelector(".qa-q").addEventListener("click", (ev) => {
      if (ev.target.closest(".star-btn") || ev.target.closest(".link-btn")) return;
      const open = card.classList.toggle("open"); aDiv.style.maxHeight = open ? aDiv.scrollHeight + "px" : "0px";
    });
    const sf = card.querySelector(".show-full-btn");
    if (sf) sf.addEventListener("click", (ev) => { ev.stopPropagation(); const t = card.querySelector(".answer-text"); const c = t.classList.toggle("clamped"); sf.textContent = c ? "Show full answer ▾" : "Show less ▴"; if (card.classList.contains("open")) aDiv.style.maxHeight = aDiv.scrollHeight + "px"; });
    const mb = card.querySelector(".mark-btn");
    mb.addEventListener("click", (ev) => { ev.stopPropagation(); const s2 = loadState(); s2.qa[id] = !s2.qa[id]; saveState(s2); mb.classList.toggle("done", s2.qa[id]); mb.textContent = s2.qa[id] ? "✓ Reviewed" : "Mark as reviewed"; card.classList.toggle("reviewed", !!s2.qa[id]); updateQaProgressBar(); refreshProgress(); });
    card.querySelector(".star-btn").addEventListener("click", (ev) => { ev.stopPropagation(); toggleBookmark("qa", item.q); renderQaList(); });
    card.querySelector(".link-btn").addEventListener("click", (ev) => { ev.stopPropagation(); copyDeepLink("qa", item.q); });
    wrap.appendChild(card);
  });
}
function updateQaProgressBar() {
  const st = loadState(); const done = QA.filter(it => st.qa[it.cat + "::" + it.q]).length; const pct = QA.length ? Math.round(done / QA.length * 100) : 0;
  const t = document.getElementById("progress-text"), b = document.getElementById("progress-bar");
  if (t) t.textContent = `${done} / ${QA.length} reviewed`; if (b) b.style.width = pct + "%";
}

/* ============================================================
   Pitch, career, glossary, tips, learn
   ============================================================ */
let pitchTimer = null, pitchLeft = 90;
function renderPitch() {
  document.getElementById("pitch-flow").innerHTML = PITCH_FLOW.map((p, i) => `<div class="pitch-step"><div class="ps-n">${String(i + 1).padStart(2, "0")} ${i < PITCH_FLOW.length - 1 ? "→" : ""}</div><h4>${esc(p.t)}</h4><p>${esc(p.d)}</p><div class="sec">${p.s}</div></div>`).join("");
  document.getElementById("elevator-pitch").textContent = ELEVATOR_PITCH;
  document.getElementById("copy-pitch-btn").addEventListener("click", (e) => copyText(ELEVATOR_PITCH, e.currentTarget, "📋 Copy pitch"));
  document.getElementById("project-faq").innerHTML = PROJECT_FAQ.map(f => `<div class="faq-item"><h4>${esc(f.q)}</h4><p>${esc(f.a)}</p></div>`).join("");
  const ta = document.getElementById("pitch-text"), timer = document.getElementById("pitch-timer");
  const st = loadState(); if (st.pitch.text) ta.value = st.pitch.text;
  const draw = () => { const m = Math.floor(Math.abs(pitchLeft) / 60), s = Math.abs(pitchLeft) % 60; timer.textContent = (pitchLeft < 0 ? "+" : "") + m + ":" + String(s).padStart(2, "0"); timer.className = "timer" + (pitchLeft < 0 ? " over" : pitchLeft <= 15 ? " warn" : ""); };
  const analyse = () => {
    const txt = ta.value.toLowerCase(); const words = (ta.value.trim().match(/\S+/g) || []).length;
    document.getElementById("pitch-meta").textContent = `${words} words · about ${Math.round(words / 2.5)} seconds spoken (target 200–230 words for 90 s)`;
    document.getElementById("pitch-checks").innerHTML = PITCH_FLOW.map(p => { const hit = p.key.some(k => txt.includes(k)); return `<span class="check-pill ${hit ? "on" : ""}">${hit ? "✓" : "○"} ${esc(p.t)}</span>`; }).join("");
  };
  ta.addEventListener("input", analyse); analyse(); draw();
  document.getElementById("pitch-start").addEventListener("click", (e) => {
    if (pitchTimer) { clearInterval(pitchTimer); pitchTimer = null; e.currentTarget.textContent = "▶ Resume"; return; }
    e.currentTarget.textContent = "⏸ Pause"; ta.focus();
    pitchTimer = setInterval(() => { pitchLeft--; draw(); }, 1000);
  });
  document.getElementById("pitch-reset").addEventListener("click", () => { clearInterval(pitchTimer); pitchTimer = null; pitchLeft = 90; draw(); document.getElementById("pitch-start").textContent = "▶ Start 90-sec timer"; });
  document.getElementById("pitch-save").addEventListener("click", (e) => {
    const s2 = loadState(); s2.pitch.text = ta.value; if (ta.value.trim().length > 40) s2.pitch.practiced = true; saveState(s2); refreshProgress();
    e.currentTarget.textContent = ta.value.trim().length > 40 ? "✓ Saved & marked practiced" : "Write a little more first";
    setTimeout(() => { e.currentTarget.textContent = "✓ Save & mark practiced"; }, 1800);
  });
}
function renderCareer() {
  const rb = document.getElementById("resume-block");
  const text = `${RESUME_PROJECT.title}\n${RESUME_PROJECT.tools}\nKey Contributions\n${RESUME_PROJECT.bullets.map(b => "- " + b).join("\n")}`;
  rb.innerHTML = `<h3>${esc(RESUME_PROJECT.title)}</h3><div class="tools-line">${esc(RESUME_PROJECT.tools)}</div><strong style="font-size:13.5px;">Key Contributions</strong>
    <ul>${RESUME_PROJECT.bullets.map(b => `<li>${esc(b)}</li>`).join("")}</ul><div class="copy-row"><button class="btn-dark" id="copy-resume">📋 Copy Resume Description</button></div>`;
  document.getElementById("copy-resume").addEventListener("click", (e) => copyText(text, e.currentTarget, "📋 Copy Resume Description"));
  const bw = document.getElementById("resume-bullets");
  bw.innerHTML = RESUME_BULLETS.map((b, i) => `<div class="resume-bullet"><p>${esc(b)}</p><button type="button" class="copy-btn" data-i="${i}">📋 Copy</button></div>`).join("");
  bw.querySelectorAll("[data-i]").forEach(b => b.addEventListener("click", () => copyText(RESUME_BULLETS[+b.dataset.i], b, "📋 Copy")));
  document.getElementById("linkedin-post").textContent = LINKEDIN_POST;
  document.getElementById("copy-linkedin-btn").addEventListener("click", (e) => copyText(LINKEDIN_POST, e.currentTarget, "📋 Copy post"));
  document.getElementById("portfolio-grid").innerHTML = PORTFOLIO.map(t => `<div class="card tip-card"><div class="n">${t.n}</div><h4>${esc(t.h)}</h4><p>${esc(t.p)}</p></div>`).join("");
}
function renderGlossary(filterText) {
  const wrap = document.getElementById("gloss-grid"); const q = (filterText || "").trim().toLowerCase();
  const list = GLOSSARY.filter(g => !q || (g.t + g.d).toLowerCase().includes(q));
  wrap.innerHTML = list.length ? list.map(g => `<div class="card gloss-card" id="gl-${slugify(g.t)}"><h4>${esc(g.t)}</h4><p>${esc(g.d)}</p></div>`).join("") : `<div class="empty-state">No terms match that search.</div>`;
}
function renderTips() {
  document.getElementById("tip-grid").innerHTML = TIPS.map(t => `<div class="card tip-card"><div class="n">${t.n}</div><h4>${esc(t.h)}</h4><p>${esc(t.p)}</p></div>`).join("");
  document.getElementById("tip-callout").textContent = TIP_CALLOUT;
  document.getElementById("weak-strong-list").innerHTML = WEAK_STRONG.map(ws => `<div class="ws-card"><div class="ws-q">${esc(ws.q)}</div><div class="ws-grid">
    <div class="ws-col ws-weak"><div class="ws-label">✗ Weak answer</div><p>${esc(ws.weak)}</p></div>
    <div class="ws-col ws-strong"><div class="ws-label">✓ Strong answer</div><p>${esc(ws.strong)}</p></div></div></div>`).join("");
}
function renderLearningLinks() {
  document.getElementById("learn-grid").innerHTML = LEARNING_LINKS.map((l, i) => `<a class="learn-card tint-${i % 6}" href="${l.url}" target="_blank" rel="noopener"><span class="learn-source">${esc(l.source)}</span><h4>${esc(l.title)}</h4><p>${esc(l.desc)}</p><span class="learn-cta">Open resource ↗</span></a>`).join("");
}
function renderProgressPage() {
  const r = document.getElementById("reset-progress");
  if (r) r.addEventListener("click", () => {
    if (!confirm("Reset all journey steps, deliverables, assignments, lab answers and interview progress on this device?")) return;
    saveState({}); try { localStorage.removeItem(STORE_KEY); } catch (e) {}
    renderJourney(); renderChecklist("deliv-grid", DELIVERABLES, "deliv"); renderAssignments(); renderLab(); renderQaList(); renderQA(); refreshProgress();
  });
}

function renderSamples() {
  const g = document.getElementById("sample-grid");
  if (g) {
    g.innerHTML = SAMPLE_IMAGE_DASHBOARDS.map((d, i) => `
      <div class="card sample-card">
        <img src="${d.img}" alt="${esc(d.t)} by ${esc(d.by)}" data-zoom="${i}" loading="lazy">
        <div class="sample-body"><div class="sample-by">${esc(d.by)}</div><h4>${esc(d.t)}</h4>
          <p><strong>What it does:</strong> ${esc(d.does)}</p><p><strong>KPIs:</strong> ${esc(d.kpis)}</p>
          <p><strong>Visuals:</strong> ${esc(d.visuals)}</p><div class="sample-px">➜ ${esc(d.proxima)}</div></div>
      </div>`).join("");
    g.querySelectorAll("[data-zoom]").forEach(im => im.addEventListener("click", () => openModal(`<img class="zoom-img" src="${im.src}" alt="${esc(im.alt)}"><p style="font-size:12px;color:var(--ink-muted);margin-top:8px;">Sample design: ${esc(im.alt)}. Wireframe / concept for layout; use the KPI Library numbers in your build.</p>`)));
  }
  const w = document.getElementById("vidi-cards");
  if (w) {
    const li = (arr) => `<ul>${arr.map(x => `<li>${esc(x)}</li>`).join("")}</ul>`;
    w.innerHTML = VIDI_DASHBOARDS.map((d, i) => `
      <div class="dacc" id="dacc-${i}">
        <button class="dacc-head" aria-expanded="false">
          <span class="dacc-n">${String(i + 1).padStart(2, "0")}</span>
          <span class="dacc-t"><strong>${esc(d.name)}</strong><span>${esc(d.tag)}</span></span>
          <span class="dacc-tool">${esc(d.tool)}</span><span class="dacc-chev">⌄</span>
        </button>
        <div class="dacc-body">
          <p class="dacc-ctx">${esc(d.context)}</p>
          <div class="dacc-grid">
            <div><h5>📋 What it shows</h5><p>${esc(d.what)}</p></div>
            <div><h5>❓ Business question it answers</h5><p>${esc(d.question)}</p></div>
            <div><h5>👥 Who uses it</h5><p>${esc(d.who)}</p></div>
            <div><h5>🎛️ Filters / slicers</h5><p>${esc(d.filters)}</p></div>
            <div><h5>📊 Key KPIs</h5>${li(d.kpis)}</div>
            <div><h5>📈 Visuals</h5>${li(d.visuals)}</div>
          </div>
          <div class="dacc-build"><h5>🛠️ Build it with the Shodwe data</h5>${li(d.build)}</div>
          <div class="dacc-foot"><span class="dacc-insight">💡 Shodwe example: ${esc(d.proxima)}</span><span class="dacc-page">Gallery page: ${esc(d.page)}</span></div>
        </div>
      </div>`).join("");
    const setOpen = (card, open) => { card.classList.toggle("open", open); card.querySelector(".dacc-head").setAttribute("aria-expanded", open); };
    w.querySelectorAll(".dacc").forEach(c => c.querySelector(".dacc-head").addEventListener("click", () => setOpen(c, !c.classList.contains("open"))));
    const oa = document.getElementById("acc-open-all"), ca = document.getElementById("acc-close-all");
    if (oa) oa.addEventListener("click", () => w.querySelectorAll(".dacc").forEach(c => setOpen(c, true)));
    if (ca) ca.addEventListener("click", () => w.querySelectorAll(".dacc").forEach(c => setOpen(c, false)));
  }
}
function renderQaRefs() {
  const w = document.getElementById("qa-refs"); if (!w) return;
  w.innerHTML = QA_REFERENCES.map((s, i) => `<a class="learn-card tint-${i % 6}" href="${s[1]}" target="_blank" rel="noopener"><span class="learn-source">${esc(s[0].split(":")[0])}</span><h4>${esc(s[0].split(": ").slice(1).join(": ") || s[0])}</h4><span class="learn-cta">Open source ↗</span></a>`).join("");
}
function initBrandHome() {
  document.querySelectorAll("#brand-home, .brand-home-link").forEach(a => a.addEventListener("click", (e) => {
    e.preventDefault(); if (location.hash) history.replaceState(null, "", location.pathname); switchView("overview");
  }));
}

function renderTraps() {
  const g = document.getElementById("trap-grid"); if (g) g.innerHTML = INTERVIEW_TRAPS.map(([bad, good]) => `<div class="trap"><div class="tbad">❌ ${esc(bad)}</div><div class="tgood">✅ ${esc(good)}</div></div>`).join("");
  const p = document.getElementById("pres-list"); if (p) p.innerHTML = PRESENTATION.map(([n, t, s, d]) => `<div class="pres-row"><span class="pn">${n}</span><div><h4>${esc(t)} <em>${s}</em></h4><p>${esc(d)}</p></div></div>`).join("");
}
function renderCertificate() {
  const box = document.getElementById("cert-box"); if (!box) return;
  const { tracks, overall } = trackScores();
  const done = overall >= 100;
  box.innerHTML = `<h4>${done ? "🎉 Hospitality Analytics Capstone Completed" : "🏅 Completion certificate"}</h4>
    <div class="cert-ticks">${tracks.map(t => `<span class="${t.pct >= 100 ? "on" : ""}">${t.pct >= 100 ? "✓" : "○"} ${esc(t.name)}</span>`).join("")}</div>
    ${done ? `<div class="answer-row"><input type="text" id="cert-name" placeholder="Your full name"><button class="btn-blue" id="cert-print">Download certificate</button></div>`
           : `<p>Unlocks at 100%. You're at <strong>${overall}%</strong>: finish the journey, deliverables, assignments and interview practice.</p>`}`;
  const b = document.getElementById("cert-print");
  if (b) b.addEventListener("click", () => {
    const nm = (document.getElementById("cert-name").value || "").trim(); if (!nm) { chatToastMini("Type your name first."); return; }
    document.getElementById("print-sheet").innerHTML = `<div class="cert-print"><img src="assets/shodwe-logo.png" alt="" style="width:160px;border-radius:8px;"><h1>Certificate of Completion</h1><p>This certifies that</p><h2>${esc(nm)}</h2>
      <p>has completed the <strong>ShodweStay Hospitality Analytics Capstone</strong>: data model, SQL, Excel, Tableau, Power BI, KPI implementation, QA reconciliation, business analysis and interview preparation.</p>
      <p style="margin-top:30px;">Mahendra Singh · Data Analyst Trainer, ExcelR &nbsp;|&nbsp; ${new Date().toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}</p>
      <p style="font-size:10px;color:#777;margin-top:20px;">Self-tracked completion on the ShodweStay Hospitality Analytics learning hub.</p></div>`;
    setTimeout(() => window.print(), 80);
  });
}
/* ============================================================
   Navigation
   ============================================================ */
const LAST_VIEW_KEY = "shodwe_hub_last_view_v1";
const VIEW_LABELS = {
  schedule: "Project Schedule & Status", progress: "My Progress", problem: "Problem & Business Questions", rules: "Rules & Regulations", dataset: "Dataset", model: "Data Model",
  datadict: "Data Dictionary", quality: "Data Quality", kpis: "KPI Library", sql: "SQL Lab", excel: "Excel Analysis", analysis: "Business Analysis",
  dashboards: "Dashboard Gallery", qa: "QA & Reconciliation", assignments: "Assignments", lab: "Analyst Thinking Lab", interview: "Interview Questions",
  pitch: "90-sec Project Pitch", career: "Resume, LinkedIn & Portfolio", glossary: "Glossary", tips: "Student Tips", learnmore: "Learn More",
};
function switchView(viewName) {
  if (viewName === "journey-anchor") {
    switchView("overview");
    setTimeout(() => { const j = document.getElementById("journey-anchor"); if (j) j.scrollIntoView({ behavior: "smooth", block: "start" }); }, 60);
    return;
  }
  document.querySelectorAll("#nav button").forEach(x => x.classList.toggle("active", x.dataset.view === viewName));
  document.querySelectorAll("section.view").forEach(v => v.classList.remove("active"));
  const section = document.getElementById("view-" + viewName);
  if (section) section.classList.add("active");
  window.scrollTo({ top: 0, behavior: "auto" });
  closeMobileSidebar();
  if (viewName !== "overview" && VIEW_LABELS[viewName]) lsSet(LAST_VIEW_KEY, JSON.stringify({ view: viewName, ts: Date.now() }));
  if (viewName === "overview") renderContinueBanner();
  if (viewName === "progress") refreshProgress();
}
function renderContinueBanner() {
  const wrap = document.getElementById("continue-banner"); if (!wrap) return;
  let saved = null; try { saved = JSON.parse(lsGet(LAST_VIEW_KEY)); } catch (e) {}
  if (!saved || !saved.view || !VIEW_LABELS[saved.view]) { wrap.style.display = "none"; return; }
  wrap.style.display = "flex";
  wrap.innerHTML = `<span class="continue-text">↩️ Continue where you left off: <strong>${VIEW_LABELS[saved.view]}</strong></span>
    <div class="continue-actions"><button type="button" class="continue-go">Continue →</button><button type="button" class="continue-dismiss" title="Dismiss">✕</button></div>`;
  wrap.querySelector(".continue-go").addEventListener("click", () => switchView(saved.view));
  wrap.querySelector(".continue-dismiss").addEventListener("click", () => { wrap.style.display = "none"; });
}
function initNav() {
  document.querySelectorAll("#nav button").forEach(b => b.addEventListener("click", () => switchView(b.dataset.view)));
  document.querySelectorAll("[data-goto]").forEach(b => b.addEventListener("click", () => switchView(b.dataset.goto)));
}
function closeMobileSidebar() {
  const sb = document.getElementById("sidebar"), sc = document.getElementById("scrim");
  if (sb) sb.classList.remove("open"); if (sc) sc.classList.remove("show");
}
function initMobileToggle() {
  const t = document.getElementById("mobile-toggle"), sb = document.getElementById("sidebar"), sc = document.getElementById("scrim");
  if (!t || !sb || !sc) return;
  t.addEventListener("click", () => { sb.classList.toggle("open"); sc.classList.toggle("show"); });
  sc.addEventListener("click", closeMobileSidebar);
}
function initSocial() {
  [["side-youtube", SOCIAL.youtube], ["side-medium", SOCIAL.medium], ["side-linkedin", SOCIAL.linkedin], ["social-youtube", SOCIAL.youtube],
   ["social-medium", SOCIAL.medium], ["social-linkedin", SOCIAL.linkedin], ["youtube-link", SOCIAL.youtube]].forEach(([id, url]) => { const e = document.getElementById(id); if (e && url) e.href = url; });
  const fl = document.querySelectorAll(".footer-links a"); if (fl[0]) fl[0].href = SOCIAL.linkedin; if (fl[1]) fl[1].href = SOCIAL.medium;
}

/* ---- Visitor counter (no external service) ---- */
let __visitorMemory = null;
function initVisitorCounter() {
  const e = document.getElementById("visitor-count"); if (!e) return;
  const SEED = "shodwe_hub_visits_seed_v1", CNT = "shodwe_hub_visits_count_v1";
  function tryStore(store) {
    let seed = parseInt(store.getItem(SEED) || "0", 10);
    if (!seed) { seed = 180 + Math.floor(Math.random() * 220); store.setItem(SEED, String(seed)); }
    let c = parseInt(store.getItem(CNT) || "0", 10) + 1; store.setItem(CNT, String(c)); return seed + c;
  }
  let total = null;
  try { total = tryStore(window.localStorage); } catch (er) {}
  if (total === null) { try { total = tryStore(window.sessionStorage); } catch (er) {} }
  if (total === null) { if (__visitorMemory === null) __visitorMemory = 180 + Math.floor(Math.random() * 220); total = ++__visitorMemory; }
  e.textContent = total.toLocaleString("en-IN");
}

function initSearch() {
  document.getElementById("kpi-search").addEventListener("input", (e) => { kpiSearch = e.target.value; renderKpiGrid(); });
  document.getElementById("qa-search").addEventListener("input", (e) => { qaSearch = e.target.value; renderQaList(); });
  document.getElementById("gl-search").addEventListener("input", (e) => renderGlossary(e.target.value));
  document.getElementById("dd-search").addEventListener("input", (e) => renderDataDictionary(e.target.value));
}

/* ============================================================
   Ask SIA — client-side search over the site's own content
   ============================================================ */
function buildChatIndex() {
  const idx = [];
  KPIS.forEach(k => idx.push({ type: "KPI", tab: "kpis", title: k.name, text: `${k.name} ${k.q} ${k.desc} ${k.plain} ${k.cat}`,
    answer: `<strong>${esc(k.name)}</strong> (${esc(k.cat)}): ${esc(k.q)}<br>${esc(k.desc)}<br><span class="src-tag">${esc(k.formula)}</span><br><em>Answer key: ${esc(k.v25)}</em>`,
    followups: ["Show the related SQL", "What's a common mistake here?"] }));
  QA.forEach(it => idx.push({ type: "Interview Q&A", tab: "interview", title: it.q, text: `${it.q} ${it.a} ${it.cat}`,
    answer: `<strong>${esc(it.q)}</strong><br>${it.a}<div class="chat-signal">Interviewer signal: ${esc(it.signal)}</div>`,
    followups: it.cat === "Scenario-Based" ? ["Give me another scenario question", "What's a common gotcha here?"] : ["Give me a scenario question", "What's a common mistake here?"] }));
  GLOSSARY.forEach(g => idx.push({ type: "Glossary", tab: "glossary", title: g.t, text: `${g.t} ${g.d}`, answer: `<strong>${esc(g.t)}</strong>: ${esc(g.d)}`, followups: ["Show the related KPI", "Any gotchas here?"] }));
  NULL_NOTES.forEach((n, i) => idx.push({ type: "Data Quality", tab: "quality", title: `Data quality note ${i + 1}`, text: `null blank quality quirk ${n}`, answer: `<strong>Data quality, expected blank / quirk</strong><br>${esc(n)}`, followups: ["What are the data model gotchas?"] }));
  GOTCHAS.forEach(g => idx.push({ type: "Gotcha", tab: "model", title: g.t, text: `gotcha trap mistake ${g.t} ${g.d}`, answer: `<strong>⚠️ Gotcha: ${esc(g.t)}</strong><br>${esc(g.d)}`, followups: ["What's another gotcha?", "Give me an interview question on this"] }));
  TIPS.forEach(t => idx.push({ type: "Student Tip", tab: "tips", title: t.h, text: `tip advice ${t.h} ${t.p}`, answer: `<strong>Tip: ${esc(t.h)}</strong><br>${esc(t.p)}`, followups: ["Give me another tip"] }));
  SQL_BLOCKS.forEach(b => idx.push({ type: "SQL", tab: "sql", title: b.title, text: `sql query ${b.title} ${b.desc}`, answer: `<strong>${esc(b.title)}</strong><br>${esc(b.desc)}<pre style="white-space:pre-wrap;font-size:11px;">${esc(b.sql.slice(0, 600))}${b.sql.length > 600 ? "…" : ""}</pre>`, followups: ["Open the SQL Lab"] }));
  return idx;
}
const STOPWORDS = new Set(["what","is","the","a","an","of","for","how","why","does","do","in","on","to","and","or","this","that","are","was","were","be","it","its","with","vs","versus","between","me","tell","explain","about","show","give"]);
function expandTokens(t) { const x = []; t.forEach(w => { if (SYNONYMS[w]) x.push(...SYNONYMS[w]); }); return t.concat(x.map(s => s.toLowerCase())); }
function tokenize(s) { return s.toLowerCase().replace(/[^a-z0-9%\s]/g, " ").split(/\s+/).filter(w => w && !STOPWORDS.has(w)); }
function findByExactTitle(title, index) { return index.find(e => e.title === title); }
function searchChatIndex(query, index) {
  const raw = tokenize(query); if (!raw.length) return [];
  const toks = expandTokens(raw); const ql = query.toLowerCase();
  return index.map(e => {
    const tl = e.title.toLowerCase(), xl = e.text.toLowerCase(); let s = 0;
    toks.forEach(t => { if (tl.includes(t)) s += 3; else if (xl.includes(t)) s += 1; });
    if (ql.length > 3 && tl.includes(ql)) s += 5; return { e, s };
  }).filter(r => r.s > 0).sort((a, b) => b.s - a.s).slice(0, 3).map(r => r.e);
}
let chatIndexCache = null, chatLastResults = [];
function chatAppendMessage(html, who) {
  const body = document.getElementById("chat-panel-body"); const row = el("div", "chat-msg " + who);
  row.innerHTML = `<div class="chat-bubble">${html}</div>`; body.appendChild(row); body.scrollTop = body.scrollHeight; return row;
}
function chatAppendFollowups(fu) {
  if (!fu || !fu.length) return; const body = document.getElementById("chat-panel-body"); const w = el("div", "chat-followups");
  fu.slice(0, 3).forEach(f => { const c = el("button", "chat-followup-chip", esc(f)); c.type = "button"; c.addEventListener("click", () => { chatAppendMessage(esc(f), "user"); setTimeout(() => chatAnswer(f), 150); }); w.appendChild(c); });
  body.appendChild(w); body.scrollTop = body.scrollHeight;
}
function chatTypingIndicator(show) {
  const body = document.getElementById("chat-panel-body"); let i = document.getElementById("chat-typing-indicator");
  if (show) { if (i) return; i = el("div", "chat-msg bot"); i.id = "chat-typing-indicator"; i.innerHTML = `<div class="chat-bubble chat-typing"><span></span><span></span><span></span></div>`; body.appendChild(i); body.scrollTop = body.scrollHeight; }
  else if (i) i.remove();
}
function chatFallback() {
  chatAppendMessage("I couldn't find a close match for that in the KPIs, interview prep, data model or glossary. Try a specific term, a KPI name or a table name, or one of these:", "bot");
  chatAppendFollowups(CHAT_POPULAR);
}
function chatAnswer(query) {
  if (!chatIndexCache) chatIndexCache = buildChatIndex();
  const bare = query.trim().toLowerCase().replace(/[?!.]/g, "");
  if (["why", "example", "give an example", "more"].includes(bare) && chatLastResults.length) query = chatLastResults[0].title;
  if (/open the sql lab/i.test(query)) { switchView("sql"); return; }
  if (/scenario question/i.test(query)) { const sc = QA.filter(q => q.cat === "Scenario-Based"); const p = sc[Math.floor(Math.random() * sc.length)]; query = p.q; }
  let forced = null;
  for (const r of INTENT_RULES) { if (r.re.test(query)) { forced = findByExactTitle(r.title, chatIndexCache); if (forced) break; } }
  const results = forced ? [forced] : searchChatIndex(query, chatIndexCache);
  if (!results.length) { chatFallback(); return; }
  chatLastResults = results;
  results.forEach(r => {
    const bid = "chat-a-" + Math.random().toString(36).slice(2, 9);
    const row = chatAppendMessage(`<div id="${bid}">${r.answer}</div><br><button type="button" class="chat-link-btn" data-tab="${r.tab}">Open ${VIEW_LABELS[r.tab] || r.tab} →</button><button type="button" class="chat-copy-btn">Copy</button>`, "bot");
    row.querySelector(".chat-link-btn").addEventListener("click", () => switchView(r.tab));
    const cb = row.querySelector(".chat-copy-btn"); cb.addEventListener("click", () => copyText(document.getElementById(bid).innerText, cb, "Copy"));
    chatAppendFollowups(r.followups);
  });
}
function initChatWidget() {
  const fab = document.getElementById("chat-fab"), panel = document.getElementById("chat-panel"), close = document.getElementById("chat-panel-close");
  const form = document.getElementById("chat-panel-form"), input = document.getElementById("chat-input"), label = document.getElementById("chat-fab-label");
  if (!fab || !panel || !form) return;
  fab.addEventListener("click", () => { panel.classList.toggle("open"); if (panel.classList.contains("open")) { input.focus(); if (label) label.classList.add("hide"); renderQuickReplies(); } });
  close.addEventListener("click", () => { panel.classList.remove("open"); if (label) label.classList.remove("hide"); });
  form.addEventListener("submit", (e) => { e.preventDefault(); const q = input.value.trim(); if (!q) return; chatAppendMessage(esc(q), "user"); input.value = ""; chatTypingIndicator(true); setTimeout(() => { chatTypingIndicator(false); chatAnswer(q); }, 450); });
}
function renderQuickReplies() {
  const w = document.getElementById("chat-quick-replies"); if (!w) return;
  const pick = [...QUICK_REPLY_POOL].sort(() => Math.random() - 0.5).slice(0, 5);
  w.innerHTML = pick.map(q => `<button type="button" data-quick="${esc(q)}">${esc(q)}</button>`).join("");
  w.querySelectorAll("button").forEach(b => b.addEventListener("click", () => { chatAppendMessage(esc(b.dataset.quick), "user"); setTimeout(() => chatAnswer(b.dataset.quick), 150); }));
}

/* ============================================================
   Bookmarks + deep links
   ============================================================ */
const BOOKMARK_KEY = "shodwe_hub_bookmarks_v1";
function getBookmarks() { try { const r = JSON.parse(lsGet(BOOKMARK_KEY)); return r && r.kpi && r.qa ? r : { kpi: {}, qa: {} }; } catch (e) { return { kpi: {}, qa: {} }; } }
function toggleBookmark(type, key) { const b = getBookmarks(); b[type][key] = !b[type][key]; if (!b[type][key]) delete b[type][key]; lsSet(BOOKMARK_KEY, JSON.stringify(b)); }
function copyDeepLink(type, key) {
  const url = `${location.origin}${location.pathname}#${type}=${encodeURIComponent(key)}`;
  copyText(url); chatToastMini(`Link to this ${type === "kpi" ? "KPI" : "question"} copied. Paste it anywhere to jump straight here.`);
}
function chatToastMini(msg) {
  let t = document.getElementById("mini-toast");
  if (!t) { t = el("div"); t.id = "mini-toast"; t.style.cssText = "position:fixed;left:50%;bottom:24px;transform:translateX(-50%);background:var(--ink);color:var(--paper);padding:10px 18px;border-radius:8px;font-size:12.5px;z-index:1000;box-shadow:0 8px 24px rgba(0,0,0,0.3);opacity:0;transition:opacity 0.25s;"; document.body.appendChild(t); }
  t.textContent = msg; t.style.opacity = "1"; clearTimeout(t._t); t._t = setTimeout(() => { t.style.opacity = "0"; }, 2400);
}
function handleDeepLink() {
  const hash = location.hash.slice(1); if (!hash) return;
  const [type, raw] = hash.split("="); if (!type || !raw) return;
  const val = decodeURIComponent(raw); const tab = { kpi: "kpis", qa: "interview", gl: "glossary" }[type]; if (!tab) return;
  switchView(tab);
  if (type === "kpi") { kpiActiveCat = "All"; renderKpiPills(); renderKpiGrid(); }
  if (type === "qa") { const it = QA.find(q => q.q === val); if (it) { qaActiveCat = it.cat; renderQaTabs(); renderQaList(); } }
  setTimeout(() => {
    const target = document.getElementById((type === "kpi" ? "kpi-" : type === "qa" ? "qa-" : "gl-") + slugify(val)); if (!target) return;
    target.scrollIntoView({ behavior: "smooth", block: "center" }); target.classList.add("deep-link-flash");
    if (type === "qa") { target.classList.add("open"); const a = target.querySelector(".qa-a"); if (a) a.style.maxHeight = a.scrollHeight + "px"; }
    setTimeout(() => target.classList.remove("deep-link-flash"), 1900);
  }, 120);
}

/* ============================================================
   Dark mode + streak
   ============================================================ */
const THEME_KEY = "shodwe_hub_theme_v1";
function initThemeToggle() {
  const btn = document.getElementById("theme-toggle"), icon = document.getElementById("theme-toggle-icon"), label = document.getElementById("theme-toggle-label");
  if (!btn) return;
  const apply = (dark) => { document.body.classList.toggle("dark-mode", dark); if (icon) icon.textContent = dark ? "☀️" : "🌙"; if (label) label.textContent = dark ? "Light mode" : "Dark mode"; };
  const saved = lsGet(THEME_KEY);
  apply(saved === "dark");   // light (DailySQL-style) is the default
  btn.addEventListener("click", () => { const d = !document.body.classList.contains("dark-mode"); apply(d); lsSet(THEME_KEY, d ? "dark" : "light"); });
}
const STREAK_KEY = "shodwe_hub_visit_days_v1";
function updateStreak() {
  const badge = document.getElementById("streak-badge"); if (!badge) return;
  let days = []; try { days = JSON.parse(lsGet(STREAK_KEY)) || []; } catch (e) {}
  const today = new Date().toISOString().slice(0, 10);
  if (!days.includes(today)) { days.push(today); lsSet(STREAK_KEY, JSON.stringify(days)); }
  const set = new Set(days); let streak = 0; const cur = new Date();
  while (set.has(cur.toISOString().slice(0, 10))) { streak++; cur.setDate(cur.getDate() - 1); }
  badge.innerHTML = `<span class="flame">🔥</span> <b>${streak}</b>-day study streak · ${days.length} total visit${days.length === 1 ? "" : "s"}`;
}

/* ============================================================
   Flashcard quiz
   ============================================================ */
let quizDeck = [], quizDeckType = "qa", quizIndex = 0, quizScore = { good: 0, again: 0 };
function shuffleArray(a) { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; }
function startQuiz(type) {
  let deck;
  if (type === "kpi") deck = KPIS.map(k => ({ q: k.name, a: `${esc(k.q)}<br>${esc(k.desc)}<code style="display:block;margin-top:8px;font-size:12px;">${esc(k.plain)}</code>`, cat: k.cat }));
  else if (type === "glossary") deck = GLOSSARY.map(g => ({ q: g.t, a: esc(g.d), cat: "Glossary" }));
  else { const bm = getBookmarks(); const st = QA.filter(q => bm.qa[q.q]); deck = st.length >= 5 ? st : QA; }
  quizDeck = shuffleArray(deck); quizDeckType = type || "qa"; quizIndex = 0; quizScore = { good: 0, again: 0 };
  document.getElementById("quiz-overlay").classList.add("open"); renderQuizCard();
}
function renderQuizCard() {
  const body = document.getElementById("quiz-body");
  if (quizIndex >= quizDeck.length) {
    const total = quizScore.good + quizScore.again;
    body.innerHTML = `<div class="quiz-done"><div class="big-score">${quizScore.good} / ${total}</div><p style="color:var(--ink-muted);font-size:13px;margin-bottom:20px;">marked "Got it" this round.</p><button class="btn-dark" id="quiz-restart">Run again</button></div>`;
    document.getElementById("quiz-restart").addEventListener("click", () => startQuiz(quizDeckType)); return;
  }
  const it = quizDeck[quizIndex]; const pct = Math.round(quizIndex / quizDeck.length * 100);
  body.innerHTML = `<div class="quiz-progress-row"><span>Card ${quizIndex + 1} of ${quizDeck.length}</span><span>${esc(it.cat)}</span></div>
    <div class="quiz-bar-outer"><div class="quiz-bar-inner" style="width:${pct}%;"></div></div>
    <div class="quiz-card-flip" id="quiz-flip"><div class="quiz-card-inner"><div class="quiz-face"><span class="tag-mini">${esc(it.cat)}</span><div class="qtxt">${esc(it.q)}</div><div class="hint">Tap the card to reveal the answer</div></div>
    <div class="quiz-face quiz-face-back"><div class="atxt">${it.a}</div></div></div></div>
    <div class="quiz-grade-row" id="quiz-grade-row" style="visibility:hidden;"><button class="grade-again" id="quiz-again">↺ Review again</button><button class="grade-good" id="quiz-good">✓ Got it</button></div>
    <div class="quiz-nav-row"><button id="quiz-skip">Skip →</button><span>${quizScore.good} got it · ${quizScore.again} to review</span></div>`;
  const flip = document.getElementById("quiz-flip"), gr = document.getElementById("quiz-grade-row");
  flip.addEventListener("click", () => { flip.classList.toggle("flipped"); gr.style.visibility = flip.classList.contains("flipped") ? "visible" : "hidden"; });
  document.getElementById("quiz-again").addEventListener("click", (e) => { e.stopPropagation(); quizScore.again++; quizIndex++; renderQuizCard(); });
  document.getElementById("quiz-good").addEventListener("click", (e) => { e.stopPropagation(); quizScore.good++; quizIndex++; renderQuizCard(); });
  document.getElementById("quiz-skip").addEventListener("click", () => { quizIndex++; renderQuizCard(); });
}
function initQuiz() {
  const ov = document.getElementById("quiz-overlay");
  document.getElementById("quiz-launch-btn").addEventListener("click", () => startQuiz("qa"));
  document.getElementById("quiz-close").addEventListener("click", () => ov.classList.remove("open"));
  ov.addEventListener("click", (e) => { if (e.target === ov) ov.classList.remove("open"); });
  document.getElementById("kpi-quiz-launch-btn").addEventListener("click", () => startQuiz("kpi"));
  document.getElementById("gl-quiz-launch-btn").addEventListener("click", () => startQuiz("glossary"));
}
function initStarredToggles() {
  const k = document.getElementById("kpi-starred-toggle"), q = document.getElementById("qa-starred-toggle");
  k.addEventListener("click", () => { kpiStarredOnly = !kpiStarredOnly; k.classList.toggle("active", kpiStarredOnly); renderKpiGrid(); });
  q.addEventListener("click", () => { qaStarredOnly = !qaStarredOnly; q.classList.toggle("active", qaStarredOnly); renderQaList(); });
}

/* ============================================================
   Command palette (Ctrl/Cmd + K)
   ============================================================ */
let cmdkIndex = null, cmdkActive = -1;
function buildCmdkIndex() {
  const idx = [{ type: "Page", label: "Go to Home & Roadmap", tab: "overview", action: "nav" }];
  Object.entries(VIEW_LABELS).forEach(([tab, label]) => idx.push({ type: "Page", label: "Go to " + label, tab, action: "nav" }));
  KPIS.forEach(k => idx.push({ type: "KPI", label: k.name, action: "kpi", key: k.name }));
  QA.forEach(q => idx.push({ type: "Q&A", label: q.q, action: "qa", key: q.q }));
  GLOSSARY.forEach(g => idx.push({ type: "Term", label: g.t, action: "gl", key: g.t }));
  assignments().forEach(a => idx.push({ type: "Assignment", label: a.t, tab: "assignments", action: "nav" }));
  return idx;
}
function openCmdk() { if (!cmdkIndex) cmdkIndex = buildCmdkIndex(); const ov = document.getElementById("cmdk-overlay"), inp = document.getElementById("cmdk-input"); ov.classList.add("open"); inp.value = ""; inp.focus(); renderCmdkResults(""); }
function closeCmdk() { document.getElementById("cmdk-overlay").classList.remove("open"); }
function renderCmdkResults(query) {
  const wrap = document.getElementById("cmdk-results"); const q = query.trim().toLowerCase();
  const results = !q ? cmdkIndex.filter(r => r.type === "Page") : cmdkIndex.filter(r => r.label.toLowerCase().includes(q)).slice(0, 30);
  cmdkActive = results.length ? 0 : -1;
  if (!results.length) { wrap.innerHTML = `<div class="cmdk-empty">No matches. Try a different term.</div>`; wrap._results = []; return; }
  wrap.innerHTML = results.map((r, i) => `<button class="cmdk-item${i === 0 ? " active" : ""}" data-idx="${i}"><span class="cmdk-type">${r.type}</span><span class="cmdk-label">${esc(r.label)}</span></button>`).join("");
  wrap.querySelectorAll(".cmdk-item").forEach(b => {
    b.addEventListener("click", () => selectCmdkResult(results[+b.dataset.idx]));
    b.addEventListener("mouseenter", () => { wrap.querySelectorAll(".cmdk-item").forEach(x => x.classList.remove("active")); b.classList.add("active"); cmdkActive = +b.dataset.idx; });
  });
  wrap._results = results;
}
function selectCmdkResult(r) {
  closeCmdk();
  if (r.action === "nav") { switchView(r.tab); return; }
  location.hash = r.action + "=" + encodeURIComponent(r.key); handleDeepLink();
}
function initCmdk() {
  const hint = document.getElementById("cmdk-fab-hint"), ov = document.getElementById("cmdk-overlay"), inp = document.getElementById("cmdk-input");
  const isMac = /Mac|iPhone|iPad/.test(navigator.platform || navigator.userAgent);
  const kl = document.getElementById("cmdk-kbd-label"); if (kl && isMac) kl.textContent = "⌘ K";
  if (hint) hint.addEventListener("click", openCmdk);
  ov.addEventListener("click", (e) => { if (e.target === ov) closeCmdk(); });
  document.addEventListener("keydown", (e) => {
    const mod = isMac ? e.metaKey : e.ctrlKey;
    if (mod && e.key.toLowerCase() === "k") { e.preventDefault(); ov.classList.contains("open") ? closeCmdk() : openCmdk(); return; }
    if (!ov.classList.contains("open")) return;
    const results = document.getElementById("cmdk-results")._results || [];
    if (e.key === "Escape") closeCmdk();
    else if (e.key === "ArrowDown") { e.preventDefault(); cmdkActive = Math.min(cmdkActive + 1, results.length - 1); hl(); }
    else if (e.key === "ArrowUp") { e.preventDefault(); cmdkActive = Math.max(cmdkActive - 1, 0); hl(); }
    else if (e.key === "Enter") { e.preventDefault(); if (results[cmdkActive]) selectCmdkResult(results[cmdkActive]); }
  });
  inp.addEventListener("input", () => renderCmdkResults(inp.value));
  function hl() { const w = document.getElementById("cmdk-results"); w.querySelectorAll(".cmdk-item").forEach((b, i) => b.classList.toggle("active", i === cmdkActive)); const a = w.querySelector(".cmdk-item.active"); if (a) a.scrollIntoView({ block: "nearest" }); }
}

/* ============================================================
   Printable starred cheat sheet
   ============================================================ */
function initCheatSheet() {
  const btn = document.getElementById("cheatsheet-btn"); if (!btn) return;
  btn.addEventListener("click", () => {
    const bm = getBookmarks(); const ks = KPIS.filter(k => bm.kpi[k.name]); const qs = QA.filter(q => bm.qa[q.q]);
    if (!ks.length && !qs.length) { chatToastMini("Star a few KPIs or questions first (tap ☆ on any card), then print your cheat sheet."); return; }
    document.getElementById("print-sheet").innerHTML = `<h1>ShodweStay Hospitality Analytics: My Cheat Sheet</h1><p style="color:#666;font-size:11px;margin-bottom:16px;">Generated from starred items · ${new Date().toLocaleDateString()}</p>
      ${ks.length ? `<h3>KPIs (${ks.length})</h3>` + ks.map(k => `<div class="ps-item"><h4>${esc(k.name)}</h4><p>${esc(k.desc)}</p><code>${esc(k.plain)}</code></div>`).join("") : ""}
      ${qs.length ? `<h3 style="margin-top:16px;">Interview Questions (${qs.length})</h3>` + qs.map(q => `<div class="ps-item"><h4>${esc(q.q)}</h4><p>${q.a}</p></div>`).join("") : ""}`;
    setTimeout(() => window.print(), 80);
  });
}

/* ============================================================
   Boot — each step isolated so one failure doesn't stop the page
   ============================================================ */
document.addEventListener("DOMContentLoaded", () => {
  const steps = [
    renderStats, renderJourney, () => renderChecklist("deliv-grid", DELIVERABLES, "deliv"), renderBeforeAfter, renderTools, renderDomainPrimer,
    renderDocuments, renderFlow, renderTimeline, renderProblem, renderRules, renderDataset, renderModel, renderDataDictionary, renderQuality,
    renderKpiPills, renderKpiGrid, renderSql, renderExcel, renderAnalysis, renderGallery, renderQA, renderAssignments, renderLab,
    renderQaTabs, renderQaList, renderPitch, renderCareer, renderGlossary, renderTips, renderLearningLinks, renderProgressPage,
    initNav, initMobileToggle, initSearch, initSocial, initChatWidget, initThemeToggle, updateStreak,
    initQuiz, initStarredToggles, initCmdk, initCheatSheet, initModal, renderSamples, renderQaRefs, initBrandHome, renderKpiTiers, renderTraps, refreshProgress, renderContinueBanner, handleDeepLink,
  ];
  steps.forEach(fn => { try { fn(); } catch (e) { console.error("Boot step failed:", fn.name || "(anonymous)", e); } });
  window.addEventListener("hashchange", handleDeepLink);
});
/* ============================================================
   One-page KPI cheat sheet (hub feature)
   ============================================================ */
function printKpiCheatSheet() {
  const rows = KPI_CATS.filter(c => c !== "All").map(cat => {
    const items = KPIS.filter(k => k.cat === cat).map(k => `
      <div class="cs-item"><div class="cs-name">${esc(k.name)} <span class="cs-tier">${k.prio}</span></div>
        <div class="cs-formula">${esc(k.formula)}</div><div class="cs-def">${esc(k.plain)} · <b>Answer: ${esc(k.v25)}</b></div></div>`).join("");
    return `<h2>${cat}</h2><div class="cs-col">${items}</div>`;
  }).join("");
  const html = `<!DOCTYPE html><html><head><meta charset="UTF-8"><title>ShodweStay Hospitality Analytics — KPI Cheat Sheet</title>
  <style>@page { size: A4; margin: 10mm; } * { box-sizing: border-box; } body { font-family: Arial, Helvetica, sans-serif; color: #1A1D21; margin: 0; }
  .cs-header { text-align: center; margin-bottom: 10px; } .cs-header h1 { font-size: 16px; margin: 0 0 2px; } .cs-header p { font-size: 10px; color: #666; margin: 0; }
  .cs-wrap { column-count: 2; column-gap: 18px; } h2 { font-size: 12px; text-transform: uppercase; border-bottom: 1.5px solid #333; padding-bottom: 3px; margin: 10px 0 6px; break-after: avoid; }
  .cs-item { break-inside: avoid; margin-bottom: 6px; padding-bottom: 6px; border-bottom: 1px dotted #ccc; } .cs-name { font-size: 10.5px; font-weight: 700; }
  .cs-tier { font-size: 8px; background: #E6F3FA; color: #0A5A87; padding: 1px 4px; border-radius: 3px; } .cs-formula { font-family: 'Courier New', monospace; font-size: 9px; color: #0E6E9E; margin: 1px 0; }
  .cs-def { font-size: 9px; color: #444; line-height: 1.3; }</style></head><body>
  <div class="cs-header"><h1>ShodweStay Hospitality Analytics — KPI Cheat Sheet (26 measures)</h1><p>by Mahendra Singh · Data Analyst Trainer, ExcelR · Revenue = revenue_realized · capacity from fact_aggregated_bookings · weekend = Fri + Sat</p></div>
  <div class="cs-wrap">${rows}</div></body></html>`;
  const win = window.open("", "_blank");
  if (!win) { chatToastMini("Please allow pop-ups to print the cheat sheet."); return; }
  win.document.open(); win.document.write(html); win.document.close(); win.focus();
  setTimeout(() => win.print(), 300);
}
document.addEventListener("DOMContentLoaded", () => {
  const btn = document.getElementById("print-cheatsheet-btn");
  if (btn) btn.addEventListener("click", printKpiCheatSheet);
});
document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll("img.zoomable").forEach(img => img.addEventListener("click", () => openModal(`<img class="zoom-img" src="${img.src}" alt="${esc(img.alt)}">`)));
});
/* Hero floating card: revenue share by city (from hosp-data.js) */
function renderHeroCards() {
  const c3 = document.getElementById("hero-top-card"); if (!c3) return;
  const cs = ((window.HOSP && HOSP.M && HOSP.M.city_share) || []).slice(0, 4); const col = ["#2563EB", "#7C3AED", "#0EA5A4", "#F59E0B"];
  c3.innerHTML = `<div class="hf-top"><span>🏨</span><span class="hf-lv dark">Revenue share by city</span></div>${cs.map(([k, v], n) => `<div class="hf-lb"><i style="background:${col[n]}">${esc(k[0])}</i><span>${esc(k)}</span><b>${v}%</b></div>`).join("")}<div class="hf-foot">From the ShodweStay dataset</div>`;
}
function renderIntegrity() {}
document.addEventListener("DOMContentLoaded", () => { renderHeroCards(); });
/* ============================================================
   Project Schedule & Group Presentation Status
   - Students: read-only view of the schedule published by the trainer
     (project-schedule.js, or a trainer's share link).
   - Trainer: PIN unlock → edit project code, kick-off date, presentation
     day, groups and statuses → "Publish" downloads project-schedule.js
     to upload with the site. Students can't change what others see:
     only the uploaded file (or the trainer's link) is shown to everyone.
   ============================================================ */
const SCH_STAGES = [
  { key: "kickoff", t: "Project Kick-off", d: "Problem statement, KPI document and dataset walkthrough; groups formed.", week: 0, track: false },
  { key: "excel", t: "Excel Dashboard Presentation", d: "KPIs in Excel and the Excel dashboard.", week: 1, track: true },
  { key: "tableau", t: "Tableau Dashboard Presentation", d: "Tableau connected to MySQL. SQL QA can be presented this week or next.", week: 2, track: true, sqlqa: true },
  { key: "powerbi", t: "Power BI Dashboard Presentation", d: "Power BI connected to MySQL. Last chance to present SQL QA.", week: 3, track: true, sqlqa: true },
  { key: "final", t: "Final Presentation", d: "7 parts: Business Problem → Dataset → Data Model → KPIs → Dashboard → Insights → Recommendations.", week: 4, track: true },
];
const SCH_COLS = [["excel", "Excel"], ["tableau", "Tableau"], ["powerbi", "Power BI"], ["sqlqa", "SQL QA"], ["final", "Final"]];
const SCH_ST = { done: ["✅", "Done", "st-done"], pending: ["⏳", "Pending", "st-pending"], absent: ["❌", "Nobody presented", "st-absent"] };
const SCH_DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const SCH_MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const SCH_DRAFT = "shodwe_hub_schedule_draft_v1", SCH_UNLOCK = "shodwe_hub_schedule_unlocked", SCH_VIEW = "shodwe_hub_schedule_view";
let schEditCode = null;
/* Live sync. schedule-config.js: "auto" = use this site's own /api/schedule (Vercel + Upstash Redis) when it is
   connected, otherwise fall back to project-schedule.js. A full URL (e.g. a Google Apps Script web app) also works. */
const SCH_CFG = String(window.PROJECT_SCHEDULE_API || "").trim();
const SCH_AUTO = SCH_CFG.toLowerCase() === "auto";
let SCH_API = SCH_AUTO ? "" : SCH_CFG;
const SCH_PIN = "shodwe_hub_schedule_pin";
let schRemote = null, schSyncMsg = "", schSaveTimer = null, schLoaded = !SCH_API;
/* "auto": probe /api/schedule once; switch to live mode only if the server answers with a configured database. */
function schProbe() {
  if (!SCH_AUTO || !/^https?:$/.test(location.protocol)) return;
  fetch("api/schedule?t=" + Date.now(), { cache: "no-store" }).then(r => r.ok ? r.json() : null).then(j => {
    if (!j || j.configured === false || !Array.isArray(j.projects)) return;   // not set up → keep file mode
    SCH_API = "api/schedule";
    if (schIsTrainer()) { try { sessionStorage.removeItem(SCH_UNLOCK); } catch (e) {} }  // re-login against the server PIN
    schRemote = j.projects.length ? j : null; schLoaded = true;
    renderSchedule(); renderHeroSchedule();
    setInterval(() => { if (!schIsTrainer()) schLoadRemote(true); }, 60000);
  }).catch(() => {});
}
function schApi(payload) {
  return fetch(SCH_API, { method: "POST", body: JSON.stringify(payload) }).then(r => r.json());
}
function schLoadRemote(silent) {
  if (!SCH_API) return Promise.resolve();
  return fetch(SCH_API + (SCH_API.includes("?") ? "&" : "?") + "t=" + Date.now()).then(r => r.json()).then(j => {
    if (schIsTrainer() && schSaveTimer) return;                 // don't overwrite unsaved trainer edits
    schRemote = j && j.projects && j.projects.length ? j : null; schLoaded = true;
    renderSchedule(); renderHeroSchedule();
  }).catch(() => { schLoaded = true; if (!silent) { schSyncMsg = "⚠ Could not load the live schedule. Showing the last published file."; renderSchedule(); } });
}
function schPushRemote(d) {
  schRemote = d; schSyncMsg = "⏳ Saving…"; schShowSync();
  clearTimeout(schSaveTimer);
  schSaveTimer = setTimeout(() => {
    let pin = ""; try { pin = sessionStorage.getItem(SCH_PIN) || ""; } catch (e) {}
    schApi({ action: "save", pin, data: d }).then(j => {
      schSaveTimer = null;
      schSyncMsg = j.ok ? `✅ Saved ${new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })} · students see it now (on refresh)` : "⚠ Not saved: " + (j.error || "error");
      schShowSync();
    }).catch(() => { schSaveTimer = null; schSyncMsg = "⚠ Not saved: no internet or server not ready. Try again."; schShowSync(); });
  }, 700);
}
function schShowSync() { const e = document.getElementById("sch-sync"); if (e) e.textContent = schSyncMsg; }

/* ---------- tiny SHA-256 (works on file:// too) ---------- */
function sha256(str) {
  const K = [0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5, 0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174, 0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da, 0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967, 0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85, 0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070, 0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3, 0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2];
  const bytes = Array.from(new TextEncoder().encode(str)); const l = bytes.length * 8;
  bytes.push(0x80); while (bytes.length % 64 !== 56) bytes.push(0);
  for (let i = 7; i >= 0; i--) bytes.push(i >= 4 ? 0 : (l >>> (i * 8)) & 255);
  let H = [0x6a09e667, 0xbb67ae85, 0x3c6ef372, 0xa54ff53a, 0x510e527f, 0x9b05688c, 0x1f83d9ab, 0x5be0cd19];
  const r = (x, n) => (x >>> n) | (x << (32 - n));
  for (let o = 0; o < bytes.length; o += 64) {
    const w = [];
    for (let i = 0; i < 16; i++) w[i] = (bytes[o + 4 * i] << 24) | (bytes[o + 4 * i + 1] << 16) | (bytes[o + 4 * i + 2] << 8) | bytes[o + 4 * i + 3];
    for (let i = 16; i < 64; i++) { const s0 = r(w[i - 15], 7) ^ r(w[i - 15], 18) ^ (w[i - 15] >>> 3), s1 = r(w[i - 2], 17) ^ r(w[i - 2], 19) ^ (w[i - 2] >>> 10); w[i] = (w[i - 16] + s0 + w[i - 7] + s1) | 0; }
    let [a, b, c, d, e, f, g, h] = H;
    for (let i = 0; i < 64; i++) {
      const t1 = (h + (r(e, 6) ^ r(e, 11) ^ r(e, 25)) + ((e & f) ^ (~e & g)) + K[i] + w[i]) | 0, t2 = ((r(a, 2) ^ r(a, 13) ^ r(a, 22)) + ((a & b) ^ (a & c) ^ (b & c))) | 0;
      h = g; g = f; f = e; e = (d + t1) | 0; d = c; c = b; b = a; a = (t1 + t2) | 0;
    }
    H = H.map((v, i) => (v + [a, b, c, d, e, f, g, h][i]) | 0);
  }
  return H.map(v => (v >>> 0).toString(16).padStart(8, "0")).join("");
}
const schHash = (pin) => sha256("shodwe-hosp-trainer|" + pin);

/* ---------- data ---------- */
const schClone = (o) => JSON.parse(JSON.stringify(o));
function schPublished() { return schClone(window.PROJECT_SCHEDULE || { pinHash: schHash("excelr2026"), active: "", projects: [] }); }
function schFromHash() {
  const m = location.hash.match(/schedule=([A-Za-z0-9_\-]+)/); if (!m) return null;
  try { return JSON.parse(decodeURIComponent(escape(atob(m[1].replace(/-/g, "+").replace(/_/g, "/"))))); } catch (e) { return null; }
}
function schIsTrainerX() { try { return sessionStorage.getItem(SCH_UNLOCK) === "1"; } catch (e) { return false; } }
function schIsTrainer() { return schIsTrainerX(); }
function schDraft() { try { const d = JSON.parse(lsGet(SCH_DRAFT)); return d && d.projects ? d : null; } catch (e) { return null; } }
function schData() {
  if (SCH_API) {
    if (schIsTrainer()) { if (!schRemote) schRemote = schPublished(); return schRemote; }
    const base = schRemote ? schClone(schRemote) : schPublished(); const h = schFromHash();
    if (h && h.code) { base.projects = base.projects.filter(x => x.code !== h.code).concat([h]); base.active = h.code; }
    return base;
  }
  if (schIsTrainer()) return schDraft() || schPublished();
  const pub = schPublished(); const h = schFromHash();
  if (h && h.code) { pub.projects = pub.projects.filter(p => p.code !== h.code).concat([h]); pub.active = h.code; }
  return pub;
}
function schSaveDraft(d) { d.updated = new Date().toISOString(); if (SCH_API) { schPushRemote(d); return; } lsSet(SCH_DRAFT, JSON.stringify(d)); }
function schCurrent(d) {
  let code = schIsTrainer() ? schEditCode : null;
  if (!code) { try { code = lsGet(SCH_VIEW); } catch (e) {} }
  const h = schFromHash(); if (!schIsTrainer() && h && h.code) code = h.code;
  return d.projects.find(p => p.code === code) || d.projects.find(p => p.code === d.active) || d.projects[0] || null;
}
const ymd = (dt) => `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, "0")}-${String(dt.getDate()).padStart(2, "0")}`;
const parseYmd = (s) => { const [y, m, d] = s.split("-").map(Number); return new Date(y, m - 1, d); };
function schStageDates(p) {
  const k = parseYmd(p.kickoff); const out = { kickoff: p.kickoff };
  let first = new Date(k); first.setDate(first.getDate() + 6);
  while (first.getDay() !== Number(p.presDay)) first.setDate(first.getDate() + 1);
  SCH_STAGES.filter(s => s.week > 0).forEach(s => { const d = new Date(first); d.setDate(d.getDate() + 7 * (s.week - 1)); out[s.key] = (p.overrides && p.overrides[s.key]) || ymd(d); });
  if (p.overrides && p.overrides.kickoff) out.kickoff = p.overrides.kickoff;
  return out;
}
const fmtD = (s) => { const d = parseYmd(s); return `${SCH_DAYS[d.getDay()].slice(0, 3)}, ${d.getDate()} ${SCH_MONTHS[d.getMonth()]} ${d.getFullYear()}`; };
function schPhase(dateStr, nextStr) {
  const today = parseYmd(ymd(new Date())), d = parseYmd(dateStr);
  if (+d === +today) return ["today", "Today"];
  if (d < today) return ["past", "Completed"];
  const prevWeek = new Date(d); prevWeek.setDate(prevWeek.getDate() - 7);
  return today > prevWeek ? ["next", "This week"] : ["future", "Upcoming"];
}
function schNext(p) {
  const ds = schStageDates(p); const today = ymd(new Date());
  return SCH_STAGES.find(s => ds[s.key] >= today) || null;
}
function schGroupStatus(p, g, key) { const s = (p.status && p.status[g.id]) || {}; return s[key] || "pending"; }
function schCounts(p, key) { const c = { done: 0, pending: 0, absent: 0 }; (p.groups || []).forEach(g => c[schGroupStatus(p, g, key)]++); return c; }
function schNewProject(code) {
  const today = new Date(); const fri = new Date(today); while (fri.getDay() !== 5) fri.setDate(fri.getDate() - 1);
  const groups = Array.from({ length: 6 }, (_, i) => ({ id: "g" + (i + 1), name: "Group " + (i + 1), members: "" }));
  return { code, name: "Hospitality Analytics Capstone", kickoff: ymd(fri), presDay: 6, time: "9:00 PM – 10:00 PM", overrides: {}, groups, status: {} };
}

/* ---------- rendering ---------- */
const stChip = (s, extra) => `<span class="st-chip ${SCH_ST[s][2]}">${SCH_ST[s][0]} ${SCH_ST[s][1]}${extra || ""}</span>`;
function renderSchedule() {
  const root = document.getElementById("sch-root"); if (!root) return;
  const d = schData(); const p = schCurrent(d); const tr = schIsTrainer();
  document.getElementById("sch-mode").innerHTML = tr
    ? `<span class="sch-badge tr">🔓 Trainer mode</span><button class="btn-outline" id="sch-lock">Lock</button>`
    : `<span class="sch-badge">👀 Student view (read-only)</span><button class="sch-trainer-link" id="sch-unlock">Trainer login</button>`;
  const picker = d.projects.length > 1 || tr ? `<label class="sch-pick">Project code <select id="sch-select">${d.projects.map(x => `<option value="${esc(x.code)}" ${p && x.code === p.code ? "selected" : ""}>${esc(x.code)}</option>`).join("")}</select></label>` : "";
  if (!p) { root.innerHTML = `${picker}<div class="card sch-empty">No project has been published yet. ${tr ? "Create one below." : "Ask your trainer for the project link."}</div>` + (tr ? schAdminHtml(d, null) : ""); schBind(d, null); return; }
  const ds = schStageDates(p); const nx = schNext(p);
  const timeline = SCH_STAGES.map((s, i) => {
    const [ph, pl] = schPhase(ds[s.key]);
    const c = s.track ? schCounts(p, s.key) : null;
    const qa = s.sqlqa ? schCounts(p, "sqlqa") : null;
    return `<div class="sch-stage ${ph}"><div class="sch-dot">${ph === "past" ? "✓" : i}</div><div class="sch-body">
      <div class="sch-when">${fmtD(ds[s.key])} · ${esc(p.time || "")} <span class="sch-ph ${ph}">${pl}</span></div>
      <h4>${s.week ? "Week " + s.week + " · " : ""}${esc(s.t)}</h4><p>${esc(s.d)}</p>
      ${c ? `<div class="sch-counts">${stChip("done", ` ${c.done}`)}${stChip("pending", ` ${c.pending}`)}${c.absent ? stChip("absent", ` ${c.absent}`) : ""}</div>` : ""}
      ${s.sqlqa ? `<div class="sch-qa">+ SQL QA (either week): ${qa.done} of ${(p.groups || []).length} groups done</div>` : ""}
    </div></div>`;
  }).join("");
  const rows = (p.groups || []).map(g => {
    const st = (p.status && p.status[g.id]) || {};
    return `<tr><td><strong>${esc(g.name)}</strong>${g.members ? `<div class="sch-mem">${esc(g.members)}</div>` : ""}</td>${SCH_COLS.map(([k]) => `<td>${stChip(schGroupStatus(p, g, k), k === "sqlqa" && st.sqlqaWeek ? ` · ${st.sqlqaWeek === "tableau" ? "Tableau wk" : "Power BI wk"}` : "")}</td>`).join("")}<td class="sch-note">${esc(st.note || "")}</td></tr>`;
  }).join("");
  root.innerHTML = `${picker}
    <div class="sch-head card"><div><div class="sch-code">${esc(p.code)}</div><h3>${esc(p.name || "Hospitality Analytics Capstone")}</h3>
      <p>Kick-off ${fmtD(ds.kickoff)} · weekly presentations every <strong>${SCH_DAYS[p.presDay]}</strong> · ${esc(p.time || "")} · ${(p.groups || []).length} groups</p></div>
      ${nx ? `<div class="sch-next"><span>Next</span><strong>${esc(nx.t)}</strong><em>${fmtD(ds[nx.key])}</em></div>` : `<div class="sch-next done"><span>Status</span><strong>Project completed 🎉</strong></div>`}</div>
    <div class="sch-timeline">${timeline}</div>
    <div class="section-head mt-40" style="margin-bottom:12px;"><div class="eyebrow">Group status</div><h2>Who has presented what</h2><p>✅ Done · ⏳ Pending · ❌ Nobody from the group presented in the meeting. SQL QA can be presented in the Tableau week or the Power BI week.</p></div>
    <div class="card table-scroll"><table class="dtable sch-table"><thead><tr><th>Group</th>${SCH_COLS.map(([, l]) => `<th>${l}</th>`).join("")}<th>Trainer note</th></tr></thead><tbody>${rows || `<tr><td colspan="7">No groups yet.</td></tr>`}</tbody></table></div>
    <p class="sch-upd">Last updated by trainer: ${p.updated ? new Date(p.updated).toLocaleString("en-IN") : "—"}</p>
    ${tr ? schAdminHtml(d, p) : ""}`;
  schBind(d, p);
}
function schAdminHtml(d, p) {
  if (!p) return `<div class="card sch-admin"><h3>Create a project</h3><div class="sch-row"><input class="search-input" id="sch-newcode" placeholder="Project code, e.g. HOSP-OCT26-B1"><button class="btn-blue" id="sch-create">Create project</button></div></div>`;
  const k = parseYmd(p.kickoff); const yrs = []; for (let y = new Date().getFullYear() - 1; y <= new Date().getFullYear() + 1; y++) yrs.push(y);
  const dim = new Date(k.getFullYear(), k.getMonth() + 1, 0).getDate();
  const ds = schStageDates(p);
  const sel = (id, opts, v) => `<select id="${id}">${opts.map(([val, lab]) => `<option value="${val}" ${String(val) === String(v) ? "selected" : ""}>${lab}</option>`).join("")}</select>`;
  const stSel = (gid, key, v) => `<select data-st="${gid}|${key}" class="st-sel ${SCH_ST[v][2]}">${Object.entries(SCH_ST).map(([s, [i, l]]) => `<option value="${s}" ${s === v ? "selected" : ""}>${i} ${l}</option>`).join("")}</select>`;
  const groups = (p.groups || []).map(g => { const st = (p.status && p.status[g.id]) || {};
    return `<tr><td><input data-gname="${g.id}" value="${esc(g.name)}"><input data-gmem="${g.id}" value="${esc(g.members || "")}" placeholder="Members (optional)"></td>
      ${SCH_COLS.map(([key]) => `<td>${stSel(g.id, key, st[key] || "pending")}${key === "sqlqa" ? sel("", [["", "Week?"], ["tableau", "Tableau wk"], ["powerbi", "Power BI wk"]], st.sqlqaWeek || "").replace('<select id=""', `<select data-qaw="${g.id}"`) : ""}</td>`).join("")}
      <td><input data-gnote="${g.id}" value="${esc(st.note || "")}" placeholder="Note"></td><td><button class="sch-del" data-gdel="${g.id}" title="Remove group">✕</button></td></tr>`; }).join("");
  return `<div class="card sch-admin">
    <div class="sch-admin-head"><h3>🔓 Trainer controls</h3>${SCH_API ? `<span class="sch-live">☁ Live sync ON: every change saves automatically and students see it.</span>` : `<span>Changes save on this device. Students see them only after you <strong>Publish</strong> (or set up Live sync).</span>`}</div>
    ${SCH_API ? `<div class="sch-sync" id="sch-sync">${esc(schSyncMsg || "☁ Connected")}</div>` : ""}
    <div class="sch-grid">
      <label>Project code<input class="search-input" id="sch-code" value="${esc(p.code)}"></label>
      <label>Project name<input class="search-input" id="sch-name" value="${esc(p.name || "")}"></label>
      <label>Kick-off: year ${sel("sch-y", yrs.map(y => [y, y]), k.getFullYear())}</label>
      <label>Month ${sel("sch-m", SCH_MONTHS.map((m, i) => [i, m]), k.getMonth())}</label>
      <label>Day ${sel("sch-d", Array.from({ length: dim }, (_, i) => [i + 1, `${i + 1} · ${SCH_DAYS[new Date(k.getFullYear(), k.getMonth(), i + 1).getDay()].slice(0, 3)}`]), k.getDate())}</label>
      <label>Presentation day ${sel("sch-pd", SCH_DAYS.map((x, i) => [i, x]), p.presDay)}</label>
      <label>Meeting time<input class="search-input" id="sch-time" value="${esc(p.time || "")}"></label>
    </div>
    <details class="sch-over"><summary>Change a single presentation date (holiday, reschedule)</summary><div class="sch-grid">${SCH_STAGES.filter(s => s.week > 0).map(s => `<label>${s.t}<input type="date" data-over="${s.key}" value="${ds[s.key]}"></label>`).join("")}<button class="btn-outline" id="sch-clearover">Reset to weekly dates</button></div></details>
    <h4 style="margin:16px 0 8px;">Groups & presentation status</h4>
    <div class="table-scroll"><table class="dtable sch-edit"><thead><tr><th>Group</th>${SCH_COLS.map(([, l]) => `<th>${l}</th>`).join("")}<th>Note</th><th></th></tr></thead><tbody>${groups}</tbody></table></div>
    <div class="sch-row"><button class="btn-outline" id="sch-addg">+ Add group</button><button class="btn-outline" id="sch-reset">↺ Reset all statuses</button><button class="btn-outline" id="sch-newp">+ New project</button><button class="btn-outline" id="sch-delp">🗑 Delete project</button><button class="btn-outline" id="sch-pin">Change PIN</button>${SCH_API ? `<button class="btn-outline" id="sch-reload">⟳ Reload from server</button>` : `<button class="btn-outline" id="sch-discard">Load live file (discard draft)</button>`}</div>
    <div class="sch-publish" ${SCH_API ? 'style="display:none"' : ""}>
      <div><strong>Publish to students</strong><p>1) Download <code>project-schedule.js</code> → 2) replace that file in the site folder (GitHub / Vercel / hosting) → students see the update. Or share a link right now (works for the selected project).</p></div>
      <div class="sch-row"><button class="btn-blue" id="sch-download">⬇ Download project-schedule.js</button><button class="btn-dark" id="sch-link">🔗 Copy student link</button></div>
    </div></div>`;
}
function schBind(d, p) {
  const $ = (id) => document.getElementById(id);
  const save = () => { if (p) p.updated = new Date().toISOString(); schSaveDraft(d); renderSchedule(); renderHeroSchedule(); };
  const selEl = $("sch-select");
  if (selEl) selEl.addEventListener("change", () => { if (schIsTrainer()) schEditCode = selEl.value; else lsSet(SCH_VIEW, selEl.value); if (schIsTrainer()) { d.active = selEl.value; schSaveDraft(d); } renderSchedule(); renderHeroSchedule(); });
  const un = $("sch-unlock");
  if (un) un.addEventListener("click", () => {
    const pin = prompt("Trainer PIN"); if (pin === null) return;
    if (SCH_API) {
      schApi({ action: "check", pin }).then(j => {
        if (!j.ok) { alert(j.error || "Wrong PIN."); return; }
        try { sessionStorage.setItem(SCH_UNLOCK, "1"); sessionStorage.setItem(SCH_PIN, pin); } catch (e) {}
        if (!schRemote) { schRemote = schDraft() || schPublished(); schSaveDraft(schRemote); }   // first live login: carry over the details already filled on this device
        schSyncMsg = "☁ Connected · changes save automatically"; renderSchedule();
      }).catch(() => alert("Could not reach the live sync server. Check your internet and try again."));
      return;
    }
    if (schHash(pin) === schPublished().pinHash || (schDraft() && schHash(pin) === schDraft().pinHash)) { try { sessionStorage.setItem(SCH_UNLOCK, "1"); } catch (e) {} if (!schDraft()) schSaveDraft(schPublished()); renderSchedule(); }
    else alert("Wrong PIN.");
  });
  const lk = $("sch-lock"); if (lk) lk.addEventListener("click", () => { try { sessionStorage.removeItem(SCH_UNLOCK); sessionStorage.removeItem(SCH_PIN); } catch (e) {} schEditCode = null; renderSchedule(); renderHeroSchedule(); });
  if (!schIsTrainer()) return;
  const cr = $("sch-create"); if (cr) cr.addEventListener("click", () => { const c = ($("sch-newcode").value || "").trim(); if (!c) return; d.projects.push(schNewProject(c)); d.active = c; schEditCode = c; save(); });
  if (!p) return;
  const on = (id, ev, fn) => { const e = $(id); if (e) e.addEventListener(ev, fn); };
  on("sch-code", "change", (e) => { const v = e.target.value.trim(); if (!v || d.projects.some(x => x !== p && x.code === v)) { alert("Code must be unique."); renderSchedule(); return; } if (d.active === p.code) d.active = v; p.code = v; schEditCode = v; save(); });
  on("sch-name", "change", (e) => { p.name = e.target.value; save(); });
  const setK = () => { const y = +$("sch-y").value, m = +$("sch-m").value; const dim = new Date(y, m + 1, 0).getDate(); const dd = Math.min(+$("sch-d").value, dim); p.kickoff = ymd(new Date(y, m, dd)); save(); };
  ["sch-y", "sch-m", "sch-d"].forEach(id => on(id, "change", setK));
  on("sch-pd", "change", (e) => { p.presDay = +e.target.value; save(); });
  on("sch-time", "change", (e) => { p.time = e.target.value; save(); });
  document.querySelectorAll("[data-over]").forEach(i => i.addEventListener("change", () => { p.overrides = p.overrides || {}; p.overrides[i.dataset.over] = i.value; save(); }));
  on("sch-clearover", "click", () => { p.overrides = {}; save(); });
  const gst = (gid) => { p.status = p.status || {}; p.status[gid] = p.status[gid] || {}; return p.status[gid]; };
  document.querySelectorAll("[data-st]").forEach(s => s.addEventListener("change", () => { const [gid, key] = s.dataset.st.split("|"); gst(gid)[key] = s.value; save(); }));
  document.querySelectorAll("[data-qaw]").forEach(s => s.addEventListener("change", () => { gst(s.dataset.qaw).sqlqaWeek = s.value; save(); }));
  document.querySelectorAll("[data-gnote]").forEach(s => s.addEventListener("change", () => { gst(s.dataset.gnote).note = s.value; save(); }));
  document.querySelectorAll("[data-gname]").forEach(s => s.addEventListener("change", () => { p.groups.find(g => g.id === s.dataset.gname).name = s.value; save(); }));
  document.querySelectorAll("[data-gmem]").forEach(s => s.addEventListener("change", () => { p.groups.find(g => g.id === s.dataset.gmem).members = s.value; save(); }));
  document.querySelectorAll("[data-gdel]").forEach(b => b.addEventListener("click", () => { if (!confirm("Remove this group?")) return; p.groups = p.groups.filter(g => g.id !== b.dataset.gdel); if (p.status) delete p.status[b.dataset.gdel]; save(); }));
  on("sch-addg", "click", () => { const n = (p.groups || []).length + 1; let id = "g" + n; while (p.groups.some(g => g.id === id)) id += "x"; p.groups.push({ id, name: "Group " + n, members: "" }); save(); });
  on("sch-reset", "click", () => { if (confirm("Reset every group's status to Pending for " + p.code + "?")) { p.status = {}; save(); } });
  on("sch-newp", "click", () => { const c = (prompt("New project code (e.g. HOSP-NOV26-B2)") || "").trim(); if (!c) return; if (d.projects.some(x => x.code === c)) { alert("That code already exists."); return; } d.projects.push(schNewProject(c)); schEditCode = c; d.active = c; save(); });
  on("sch-delp", "click", () => { if (!confirm("Delete project " + p.code + "?")) return; d.projects = d.projects.filter(x => x !== p); schEditCode = null; d.active = d.projects[0] ? d.projects[0].code : ""; save(); });
  on("sch-pin", "click", () => { const a = prompt("New trainer PIN (min 4 characters)"); if (!a || a.length < 4) return; if (prompt("Type the new PIN again") !== a) { alert("PINs don't match."); return; }
    if (SCH_API) { let pin = ""; try { pin = sessionStorage.getItem(SCH_PIN) || ""; } catch (e) {} schApi({ action: "setpin", pin, newPin: a }).then(j => { if (j.ok) { try { sessionStorage.setItem(SCH_PIN, a); } catch (e) {} alert("PIN changed on the server. Use the new PIN from now on."); } else alert(j.error || "Could not change PIN."); }).catch(() => alert("Could not reach the server.")); return; } d.pinHash = schHash(a); save(); alert("PIN changed. Download and upload project-schedule.js so the new PIN applies on the live site."); });
  on("sch-reload", "click", () => { schRemote = null; schLoadRemote(); });
  on("sch-discard", "click", () => { if (!confirm("Discard your unpublished changes on this device and load the live project-schedule.js?")) return; lsSet(SCH_DRAFT, JSON.stringify(schPublished())); schEditCode = null; renderSchedule(); renderHeroSchedule(); });
  on("sch-download", "click", () => {
    d.active = p.code; const out = schClone(d); out.updated = new Date().toISOString();
    const js = "/* Project schedule & group status. Edit it from the site (Trainer login), then replace this file. */\nwindow.PROJECT_SCHEDULE = " + JSON.stringify(out, null, 1) + ";\n";
    const a = document.createElement("a"); a.href = URL.createObjectURL(new Blob([js], { type: "text/javascript" })); a.download = "project-schedule.js"; document.body.appendChild(a); a.click(); a.remove();
  });
  on("sch-link", "click", (e) => {
    const one = schClone(p); one.updated = new Date().toISOString();
    const b64 = btoa(unescape(encodeURIComponent(JSON.stringify(one)))).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
    const url = location.href.split("#")[0] + "#schedule=" + b64;
    copyText(url, e.target, "🔗 Copy student link");
  });
}
/* ---------- hero cards (home) ---------- */
function renderHeroSchedule() {
  const d = schData(); const p = schCurrent(d);
  const c1 = document.getElementById("hero-problem-card"), c2 = document.getElementById("hero-streak-card"), c4 = document.getElementById("hero-today-card");
  if (!p) { [c1, c2, c4].forEach(c => { if (c) c.innerHTML = `<div class="hf-lv dark">PROJECT SCHEDULE</div><p style="margin-top:6px;">Your trainer will publish the schedule here.</p>`; }); return; }
  const ds = schStageDates(p); const nx = schNext(p);
  if (c1) {
    c1.innerHTML = nx ? `<div class="hf-top"><span class="hf-ic">📅</span><span class="hf-lv">${esc(p.code)}</span><span class="hf-day">${schPhase(ds[nx.key])[1]}</span></div><h5>Next: ${esc(nx.t)}</h5><p>${esc(nx.d)}</p>
      <div class="hf-when">${fmtD(ds[nx.key])}<br><small>${esc(p.time || "")}</small></div>` : `<div class="hf-top"><span class="hf-ic">🎉</span><span class="hf-lv">${esc(p.code)}</span></div><h5>Project completed</h5><p>All presentations are done.</p>`;
    c1.onclick = () => switchView("schedule");
  }
  if (c2) {
    const stg = nx && nx.track ? nx : SCH_STAGES.filter(s => s.track).reverse().find(s => ds[s.key] <= ymd(new Date())) || SCH_STAGES[1];
    const c = schCounts(p, stg.key); const n = (p.groups || []).length || 1;
    c2.innerHTML = `<div class="hf-top"><span>👥</span><span class="hf-lv dark">GROUP STATUS</span><span class="hf-fire">${esc(stg.t.split(" ")[0])}</span></div>
      <div class="hf-big">${c.done}<small>of ${n} groups done</small></div><div class="hf-bar"><i style="width:${Math.round(c.done / n * 100)}%"></i></div>
      ${(p.groups || []).slice(0, 4).map(g => { const s = schGroupStatus(p, g, stg.key); return `<div class="hf-row"><span>${esc(g.name)}</span><span class="${s === "done" ? "ok" : ""}">${SCH_ST[s][0]}</span></div>`; }).join("")}
      ${(p.groups || []).length > 4 ? `<div class="hf-foot">+${p.groups.length - 4} more groups</div>` : ""}`;
    c2.onclick = () => switchView("schedule"); c2.style.cursor = "pointer";
  }
  if (c4) {
    c4.innerHTML = `<div class="hf-lv dark" style="margin-bottom:8px;">PROJECT TIMELINE · ${esc(p.code)}</div>${SCH_STAGES.map(s => { const [ph] = schPhase(ds[s.key]); return `<div class="hf-li ${ph}"><span>${ph === "past" ? "✓" : ph === "next" || ph === "today" ? "●" : "○"}</span><span>${esc(s.t.replace(" Presentation", ""))}</span><small>${fmtD(ds[s.key]).replace(/, \d{4}$/, "")}</small></div>`; }).join("")}<div class="hf-foot"><i class="dot"></i> Weekly every ${SCH_DAYS[p.presDay]}</div>`;
    c4.onclick = () => switchView("schedule"); c4.style.cursor = "pointer";
  }
}
document.addEventListener("DOMContentLoaded", () => {
  renderSchedule(); renderHeroSchedule();
  if (schFromHash()) setTimeout(() => switchView("schedule"), 50);
  if (SCH_API) { schLoadRemote(); setInterval(() => { if (!schIsTrainer()) schLoadRemote(true); }, 60000); }
  else schProbe();
});
