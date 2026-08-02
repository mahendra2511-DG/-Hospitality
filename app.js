/* ============================================================
   Shodwe Hospitality Analytics — Project & Interview Prep
   data + rendering
   Built from a hotel booking dataset: dim_hotels, dim_rooms,
   dim_date, fact_bookings, fact_aggregated_bookings.
   ============================================================ */
const KPIS = [
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
const KPI_CATS = ["All", "Revenue", "Booking Volume & Status", "Occupancy & Capacity", "Mix Analysis", "Week-over-Week Trends"];

/* ---------------- STATS (hero strip) ---------------- */
const STATS = [{"num": "134,590", "lbl": "Bookings (May–Jul)"}, {"num": "25", "lbl": "Hotels · 4 cities"}, {"num": "4", "lbl": "Room classes"}, {"num": "5", "lbl": "Source tables"}, {"num": "26", "lbl": "KPIs & DAX measures"}];

/* ---------------- DATA MODEL ---------------- */
const TABLES = [
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
const RELATIONSHIPS = ["fact_bookings → dim_hotels  (property_id, Many:1)", "fact_bookings → dim_date  (check_in_date = date, Many:1)", "fact_bookings → dim_rooms  (room_category = room_id, Many:1)", "fact_aggregated_bookings → dim_hotels  (property_id, Many:1)", "fact_aggregated_bookings → dim_date  (check_in_date = date, Many:1)", "fact_aggregated_bookings → dim_rooms  (room_category = room_id, Many:1)", "fact_bookings ↔ fact_aggregated_bookings  — joined on the composite key (property_id, check_in_date, room_category) in the vw_hotel_booking_analysis view, not a simple 1:1 key"];
const LOAD_ORDER = ["1. dim_hotels — 25 properties across 4 cities", "2. dim_rooms — 4 room types → 4 room classes", "3. dim_date — 92 days, May–Jul 2022, with wn and day_type calculated columns", "4. fact_bookings — 134,590 individual booking transactions", "5. fact_aggregated_bookings — 9,200 rows, pre-aggregated by property/date/room-type for Occupancy % and RevPAR"];
const NULL_NOTES = ["fact_bookings.ratings_given is populated for only 56,683 of 134,590 rows (~42%) — guests who cancelled or no-showed never left a rating, which is an expected null, not a data-quality problem. Average Rating must implicitly (AVERAGE() already does this) skip the blanks rather than treating them as 0.", "fact_bookings carries 10 columns beyond what the metadata file documents — customer_id, payment_method, stay_duration, cancellation_reason, is_loyalty_member, country, customer_age, special_requests, discount_applied, booking_channel. These are genuinely present in the file and usable, they're just undocumented in the source hand-off — a realistic 'read the actual file, not just the data dictionary' situation.", "fact_aggregated_bookings has no single-column primary key — its grain is one row per (property_id, check_in_date, room_category) combination, and that's also the exact composite join key used to connect it back to fact_bookings in the mart view.", "dim_hotels has 16 Luxury properties and 9 Business properties (25 total) — an intentionally uneven split worth knowing before someone asks why Luxury dominates the Revenue by Category chart.", "Total Successful Bookings (from fact_aggregated_bookings, 134,590) happens to equal Total Bookings (from fact_bookings, also 134,590) in this dataset — that's a coincidence of how the sample data was generated, not a guaranteed identity; don't assume the two will always match in a different dataset.", "dim_date.day_type is calculated with a business-specific rule — Friday and Saturday count as 'Weekend', Sunday through Thursday as 'Weekday' — different from the calendar-standard Saturday/Sunday weekend, because that's literally what the stakeholder specified. Getting this rule wrong silently breaks every Weekday vs Weekend KPI."];
const GOTCHAS = [
  { t: "Friday + Saturday = \"Weekend\"", d: "dim_date.day_type uses a business-specific rule — Friday and Saturday, not the calendar-standard Saturday/Sunday. Every Weekday-vs-Weekend KPI is silently wrong if you rebuild this with a generic DATENAME('weekday', ...) or a textbook formula instead of the stakeholder's actual definition." },
  { t: "Two fact tables, two grains", d: "fact_bookings is one row per individual booking; fact_aggregated_bookings is one row per property × date × room_category. They join on a 3-column composite key. Dropping room_category from that join silently fans out or drops rows and quietly breaks Occupancy % and RevPAR." },
  { t: "ratings_given is null on purpose", d: "Only ~42% of fact_bookings rows have a rating — guests who cancelled or no-showed never left one. That's an expected null, not a data-quality problem, and AVERAGE() already skips blanks correctly. Don't \"fix\" it by imputing zeros." },
  { t: "revenue_realized ≠ revenue_generated", d: "Cancelled bookings retain only 60% of revenue_generated (40% is refunded); Checked Out and No Show bookings keep 100%. That logic is already baked into revenue_realized — summing revenue_generated instead silently overstates actual revenue." },
  { t: "Total Successful Bookings == Total Bookings — coincidence, not a rule", d: "In this sample, fact_aggregated_bookings' successful_bookings sum (134,590) happens to equal fact_bookings' total row count (134,590). That's specific to how this sample was generated — don't assume the two will always tie out in a different dataset, and don't build a QA check that silently passes because of it." },
  { t: "ADR: bookings vs room nights — the classic trap", d: "This project's own KPI register defines ADR as Revenue ÷ Total Bookings. In real hospitality practice ADR is usually Revenue ÷ room nights (stay_duration summed), so a 3-night booking should count as 3, not 1. Know which definition you're using and be ready to explain the difference — interviewers ask this specifically to see if you'll default to the textbook answer without checking the actual measure." },
  { t: "\"Others\" is the single biggest booking platform", d: "41% of bookings (55,066 of 134,590) fall into an unnamed \"others\" platform bucket — bigger than any named OTA. Treat that as a data-quality gap to flag, not a channel-strategy insight to act on at face value." },
];

const CALC_FIELDS = ["wn (dim_date) — WEEKNUM(dim_date[date]) — powers every Week-over-Week KPI", "day_type (dim_date) — IF(WEEKDAY(date,1) > 5, \"Weekend\", \"Weekday\") — Friday/Saturday = Weekend per stakeholder rule, not the calendar default", "room_class (via dim_rooms) — maps RT1–RT4 to Standard / Elite / Premium / Presidential", "hotel_category (via dim_hotels) — Luxury / Business, used for Revenue by Category and Class Wise Revenue visuals"];
const JOIN_GUIDE = [["DIM", "dim_hotels", "property_id", "—", "fact_bookings, fact_aggregated_bookings (1:Many)", "1 row per hotel — 25 rows, 4 cities"], ["DIM", "dim_rooms", "room_id", "—", "fact_bookings.room_category, fact_aggregated_bookings.room_category", "1 row per room type — 4 rows"], ["DIM", "dim_date", "date", "—", "fact_bookings.check_in_date, fact_aggregated_bookings.check_in_date", "1 row per day — 92 rows, May–Jul 2022"], ["FACT", "fact_bookings", "booking_id", "property_id, check_in_date, room_category", "dim_hotels, dim_date, dim_rooms", "1 row per individual booking — 134,590 rows"], ["FACT", "fact_aggregated_bookings", "— (composite)", "property_id, check_in_date, room_category", "dim_hotels, dim_date, dim_rooms, fact_bookings (composite)", "1 row per property × date × room type — 9,200 rows"]];
const JOIN_PATHS = [["Bookings by hotel", "fact_bookings[property_id] = dim_hotels[property_id]"], ["Bookings by date", "fact_bookings[check_in_date] = dim_date[date]"], ["Bookings by room class", "fact_bookings[room_category] = dim_rooms[room_id]"], ["Occupancy / RevPAR join", "fact_bookings[property_id, check_in_date, room_category] = fact_aggregated_bookings[property_id, check_in_date, room_category]"], ["Full mart view", "fact_bookings LEFT JOIN dim_hotels, dim_date, dim_rooms, fact_aggregated_bookings — exactly vw_hotel_booking_analysis"]];
const GLOBAL_FILTERS = [["Date Range", "dim_date.date"], ["Day Type", "dim_date.day_type (Weekday / Weekend)"], ["City", "dim_hotels.city"], ["Hotel Category", "dim_hotels.category (Luxury / Business)"], ["Property", "dim_hotels.property_name"], ["Room Class", "dim_rooms.room_class"], ["Booking Status", "fact_bookings.booking_status"], ["Booking Platform", "fact_bookings.booking_platform"]];
const DASHBOARDS = [["1", "Booking & Occupancy Overview", "Revenue Manager, GM, Hotel Group Leadership", "Revenue, Occupancy %, ADR, RevPAR, Total Bookings, Cancellation %", "KPI Cards w/ WoW trend arrows, Revenue by City/Category bar, Room Class donut, Weekday vs Weekend comparison, Weekly trend line"]];

/* ---------------- DATA DICTIONARY ---------------- */
const DATA_DICTIONARY = [
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
const CHART_COLORS = ["#0D9488", "#7C3AED", "#DC1F26", "#5B6472", "#F6C445", "#7FB6A8"];
const DASH_MOCKS = [
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
const SQL_BLOCKS = [
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
const PROBLEM_STATEMENT = [
  { icon: "1", ok: false, h: "Inconsistent, Manual Reporting", p: "Reports were built manually in Excel by each property, leading to inconsistent KPIs and definitions across the hotel group." },
  { icon: "2", ok: false, h: "No Real-Time Visibility", p: "Management lacked real-time visibility into occupancy and revenue, forcing reactive rather than proactive decisions." },
  { icon: "3", ok: false, h: "No Centralized Cross-Property View", p: "There was no centralized view across hotels — state-wise and property-wise performance was difficult to compare at a glance." },
  { icon: "4", ok: false, h: "Weekday vs Weekend Trends Untracked", p: "Weekend vs weekday booking trends were not tracked at all, making pricing optimization for peak days effectively impossible." },
  { icon: "5", ok: false, h: "No Room Category or Cancellation Insight", p: "There was no clear visibility on room category performance or cancellation patterns — both directly cost the business realized revenue." },
];

/* ---------------- TOOLS ---------------- */
const TOOLS = [
  { logo: "assets/excel-logo.jpg", name: "Excel", role: "Stage 1 · Work directly on the data", desc: "Work with the raw dim_hotels / dim_rooms / dim_date / fact_bookings / fact_aggregated_bookings export here — clean it, and build a first-pass pivot dashboard with the core Revenue, Occupancy % and Cancellation % KPIs before touching a database." },
  { logo: "assets/mysql-logo.png", name: "SQL", role: "Stage 2 · Load it into a database", desc: "Load the cleaned tables into SQL and build vw_hotel_booking_analysis — the pre-joined mart view that pulls hotel, date and room attributes onto every booking row." },
  { logo: "assets/tableau-logo.jpg", name: "Tableau", role: "Stage 3 · Connect to SQL, not the file", desc: "Tableau connects to SQL as its data source, not the raw Excel/CSV files, and builds the Booking & Occupancy dashboard with weekday/weekend and property-level breakdowns." },
  { logo: "assets/powerbi-logo.png", name: "Power BI", role: "Stage 4 · Connect to SQL, not the file", desc: "Power BI connects to the same SQL source, models the relationships around fact_bookings, and implements all 25 DAX measures from the metrics register — including the Week-over-Week trend measures." },
  { logo: "assets/mysql-logo.png", name: "QA / SQL", role: "Stage 5 · Match backend to dashboard", desc: "Run SQL directly against the mart view and reconcile every KPI — Revenue, Occupancy %, ADR, RevPAR, Cancellation % — against what Tableau and Power BI display." },
];

/* ---------------- DOMAIN PRIMER ---------------- */
const DOMAIN_WHAT = "Hospitality analytics turns the trail every booking, cancellation and no-show leaves behind into a measurable picture of a hotel group's performance. Instead of each property building its own inconsistent Excel report, one connected dataset lets Shodwe Group see occupancy and revenue in real time, compare properties and cities on equal footing, and finally answer the questions manual reporting couldn't — which room categories perform best, how weekday and weekend demand actually differ, and where cancellations are quietly eating into revenue.";

const DOMAIN_WHERE = [
  "Hotel chains & hospitality groups — comparing occupancy, ADR and RevPAR across properties, cities and room categories on one consistent standard.",
  "Revenue management teams — pricing decisions driven by weekday/weekend demand patterns and week-over-week trend data, not gut feel.",
  "Online travel agency (OTA) partnerships — understanding which booking platforms (MakeYourTrip, LogTrip, direct channels) actually drive volume and value.",
  "Guest experience & operations — cancellation and no-show pattern analysis to reduce revenue leakage and improve forecasting accuracy.",
];

const DOMAIN_DATA_TYPES = [
  "Booking transactions", "Room availability & capacity", "Property & room-type attributes", "Booking platform & channel data",
  "Guest ratings", "Cancellation & no-show records", "Calendar & weekday/weekend data", "Revenue (generated vs. realized)",
];

const FLOW = [
  { t: "Data Preparation", d: "Use the provided CSV/XLSX export to build an initial Excel dashboard; clean and transform the data, and define the 25 KPIs/measures up front from the metrics register." },
  { t: "SQL Integration", d: "Load dim_hotels, dim_rooms, dim_date, fact_bookings and fact_aggregated_bookings into a normalized SQL schema; set primary/foreign keys, including fact_aggregated_bookings' composite grain." },
  { t: "BI Tool Connection", d: "Connect Tableau & Power BI to SQL; build the model around fact_bookings, implement the wn and day_type calculated columns, then build vw_hotel_booking_analysis." },
  { t: "Dashboard Development", d: "Design the Booking & Occupancy Overview dashboard with KPI cards (with WoW trend arrows), Revenue by City/Category, Room Class mix, and Weekday vs Weekend comparisons." },
  { t: "QA & Validation", d: "Compare database records against dashboard visuals end-to-end — Occupancy %, RevPAR, Cancellation % — and validate the Friday/Saturday weekend rule specifically." },
];

const TIMELINE = [
  { d: "Week 1", t: "", task: "Project kick-off — BRD & metrics register walkthrough" },
  { d: "Week 1-2", t: "", task: "Implement core KPIs in Excel — Revenue, Occupancy %, Cancellation %" },
  { d: "Week 2-3", t: "", task: "SQL schema setup + vw_hotel_booking_analysis mart view" },
  { d: "Week 3-4", t: "", task: "Dashboard development — Tableau & Power BI, all 25 KPIs" },
  { d: "Week 4-5", t: "", task: "QA & reconciliation, final presentation prep" },
];

/* ---------------- RULES & REGULATIONS ---------------- */
const RULES = [
  { icon: "⚠", ok: false, h: "Attendance is mandatory", p: "Missing more than two meetings results in removal from the project. Join every meeting under the same name you registered with — an unrecognized name gets marked absent." },
  { icon: "⚠", ok: false, h: "Attendance alone isn't enough", p: "Sitting in on meetings without actively contributing will also lead to removal. Participation is graded on contribution, not presence." },
  { icon: "✓", ok: true, h: "Flag non-contributing teammates early", p: "If a team member isn't contributing, it's on the group to inform management — by call, WhatsApp, email, or during the weekly review — rather than letting it slide." },
  { icon: "✓", ok: true, h: "Contribute across every tool", p: "You're expected to contribute to Excel, SQL, Tableau, Power BI, and the final PPT. Skipping even one tool entirely puts your place on the project at risk." },
  { icon: "✓", ok: true, h: "Weekly review presentations", p: "Each group presents its progress every week — consistent updates and a prepared walkthrough are expected, not just a working dashboard at the end." },
];

const FOCUS_AREAS = [
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
const SOCIAL = {
  linkedin: "https://www.linkedin.com/in/mahendra-singh-%F0%9F%87%AE%F0%9F%87%B3%F0%9F%9A%80%E2%9D%84%EF%B8%8F-%F0%9F%90%8D-%F0%9F%A6%84-83699485/",
  medium: "https://medium.com/@mahendraa1188",
  youtube: "https://www.youtube.com/channel/UC2q-vZWSlQpiGiMcSLUqnIg",
};

const CRACKANALYTICS_URL = "https://www.crackanalytics.com/";


/* ---------------- SETUP & SOFTWARE DOWNLOADS ---------------- */
const SOFTWARE_LINKS = [
  { name: "How to import a CSV into MySQL", desc: "Step-by-step guide — load the dataset before connecting Tableau or Power BI", icon: "🗄️", type: "link", href: "https://medium.com/@mahendraa1188/how-to-import-csv-into-mysql-c3bbce297910" },
  { name: "Tableau Desktop — free download", desc: "Official installer from Tableau (free trial / Public edition)", icon: "📈", type: "link", href: "https://www.tableau.com/products/desktop-free/download" },
  { name: "Power BI Desktop — free download", desc: "Official installer from Microsoft", icon: "⚡", type: "link", href: "https://www.microsoft.com/en-us/download/details.aspx?id=58494" },
];

/* ---------------- INTERVIEW PREP ---------------- */
const QA_CATS = ["Explain This Project", "SQL", "Power BI & DAX", "Tableau", "Data Modeling", "Hospitality Domain", "Scenario-Based", "General & HR", "Rapid Fire"];

const QA = [
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

const GLOSSARY = [
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
const TIPS = [
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

const TIP_CALLOUT = "Cracking a data analyst or BI interview isn't about reciting definitions — it's about showing how you think, communicate, and handle messiness: two fact tables at different grains, a formula with a hidden business rule (Friday counts as weekend), a stakeholder who wants the occupancy number yesterday. Every question in the Interview Prep tab is really testing one of those things.";

/* ============================================================
   Chart helpers (native SVG — no external images, no dependencies)
   ============================================================ */

function svgDonut(data, size) {
  size = size || 120;
  const total = data.reduce((s, d) => s + d[1], 0);
  const r = size / 2 - 10;
  const cx = size / 2, cy = size / 2;
  const circumference = 2 * Math.PI * r;
  let offset = 0;
  let circles = "";
  data.forEach((d, i) => {
    const frac = total ? d[1] / total : 0;
    const dash = frac * circumference;
    circles += `<circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="${CHART_COLORS[i % CHART_COLORS.length]}" stroke-width="16" stroke-dasharray="${dash} ${circumference - dash}" stroke-dashoffset="${-offset}" transform="rotate(-90 ${cx} ${cy})"/>`;
    offset += dash;
  });
  return `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">${circles}</svg>`;
}

function renderDonutBlock(chart) {
  const total = chart.data.reduce((s, d) => s + d[1], 0);
  const legend = chart.data.map((d, i) => {
    const pct = total ? ((d[1] / total) * 100).toFixed(1) : "0.0";
    return `<div class="li"><span class="sw" style="background:${CHART_COLORS[i % CHART_COLORS.length]}"></span>${d[0]} — ${d[1].toLocaleString("en-US")} (${pct}%)</div>`;
  }).join("");
  return `
    <div class="mock-chart">
      <div class="ct">${chart.title}</div>
      <div class="donut-wrap">
        ${svgDonut(chart.data)}
        <div class="mock-legend">${legend}</div>
      </div>
    </div>`;
}

function renderBarBlock(chart) {
  const max = Math.max(...chart.data.map(d => d[1]));
  const suffix = chart.suffix || "";
  const prefix = chart.prefix || "";
  const rows = chart.data.map((d, i) => {
    const pct = max ? (d[1] / max) * 100 : 0;
    const label = typeof d[1] === "number" && !suffix ? d[1].toLocaleString("en-US") : d[1];
    return `
      <div class="bar-row">
        <div class="lab">${d[0]}</div>
        <div class="track"><div class="fill" style="width:${pct}%;background:${CHART_COLORS[i % CHART_COLORS.length]}"></div></div>
        <div class="val">${prefix}${label}${suffix}</div>
      </div>`;
  }).join("");
  return `<div class="mock-chart"><div class="ct">${chart.title}</div>${rows}</div>`;
}

function renderDashMock(d) {
  const kpis = d.kpis.map(k => `<div class="mock-kpi"><div class="v">${k.v}</div><div class="l">${k.l}</div></div>`).join("");
  const donuts = (d.donuts || []).map(renderDonutBlock).join("");
  const bars = (d.bars || []).map(renderBarBlock).join("");
  return `
    <div class="card dash-mock">
      <div class="mock-head"><h4>${d.title}</h4><p>${d.sub}</p></div>
      <div class="mock-kpis">${kpis}</div>
      <div class="mock-charts">${donuts}${bars}</div>
    </div>`;
}

/* ============================================================
   Rendering
   ============================================================ */

function el(tag, cls, html) {
  const e = document.createElement(tag);
  if (cls) e.className = cls;
  if (html !== undefined) e.innerHTML = html;
  return e;
}

function renderStats() {
  const wrap = document.getElementById("stat-strip");
  STATS.forEach(s => {
    const d = el("div", "stat");
    d.innerHTML = `<div class="num">${s.num}</div><div class="lbl">${s.lbl}</div>`;
    wrap.appendChild(d);
  });
}

function renderProblemStatement() {
  const wrap = document.getElementById("problem-grid");
  if (!wrap) return;
  PROBLEM_STATEMENT.forEach(r => {
    const c = el("div", "card rule-card");
    c.innerHTML = `<div class="head"><div class="icon-badge">${r.icon}</div><h4>${r.h}</h4></div><p>${r.p}</p>`;
    wrap.appendChild(c);
  });
}

function renderTools() {
  const wrap = document.getElementById("tool-grid");
  TOOLS.forEach((t, i) => {
    const c = el("div", "card tool-card");
    c.innerHTML = `<img class="tool-logo" src="${t.logo}" alt="${t.name} logo"><h4>${t.name}</h4><div class="role">${t.role}</div><p>${t.desc}</p>`;
    wrap.appendChild(c);
    if (i < TOOLS.length - 1) {
      const arrow = el("div", "tool-arrow", "→");
      wrap.appendChild(arrow);
    }
  });
}

function renderDomainPrimer() {
  document.getElementById("domain-what").textContent = DOMAIN_WHAT;
  document.getElementById("domain-where").innerHTML = DOMAIN_WHERE.map(x => `<div style="padding:5px 0;">• ${x}</div>`).join("");
  document.getElementById("domain-data").innerHTML = DOMAIN_DATA_TYPES.map(x => `<span>${x}</span>`).join("");
}

function renderResourceCards(items, containerId) {
  const wrap = document.getElementById(containerId);
  if (!wrap) return;
  wrap.innerHTML = "";
  items.forEach(d => {
    const c = el("div", "card doc-card");
    const action = d.type === "download"
      ? `<a class="doc-download" href="${d.href}" download="${d.filename}" title="Download ${d.name}">⬇</a>`
      : `<a class="doc-download" href="${d.href}" target="_blank" rel="noopener" title="Open ${d.name}">↗</a>`;
    c.innerHTML = `
      <div class="doc-icon">${d.icon}</div>
      <div class="doc-info"><h4>${d.name}</h4><p>${d.desc}</p></div>
      ${action}
    `;
    wrap.appendChild(c);
  });
}

function renderDocuments() {
  renderResourceCards(SOFTWARE_LINKS, "software-grid");
}

function renderFlow() {
  const wrap = document.getElementById("flow-grid");
  FLOW.forEach((f, i) => {
    const d = el("div", "flow-step");
    d.innerHTML = `<div class="idx">${String(i+1).padStart(2,'0')}</div><h4>${f.t}</h4><p>${f.d}</p>`;
    wrap.appendChild(d);
  });
}

function renderTimeline() {
  const wrap = document.getElementById("timeline");
  TIMELINE.forEach(r => {
    const d = el("div", "timeline-row");
    d.innerHTML = `<div class="d">${r.d}</div><div class="t">${r.t}</div><div>${r.task}</div>`;
    wrap.appendChild(d);
  });
}

function renderRules() {
  const wrap = document.getElementById("rule-grid");
  RULES.forEach(r => {
    const c = el("div", "card rule-card" + (r.ok ? " ok" : ""));
    c.innerHTML = `<div class="head"><div class="icon-badge">${r.icon}</div><h4>${r.h}</h4></div><p>${r.p}</p>`;
    wrap.appendChild(c);
  });
  const focus = document.getElementById("focus-grid");
  FOCUS_AREAS.forEach(f => {
    const c = el("div", "card tip-card");
    c.innerHTML = `<h4 style="margin-top:0;">${f.h}</h4><p>${f.p}</p>`;
    focus.appendChild(c);
  });
}

let kpiActiveCat = "All";
let kpiSearch = "";
let kpiStarredOnly = false;

function renderKpiPills() {
  const wrap = document.getElementById("kpi-pills");
  wrap.innerHTML = "";
  KPI_CATS.forEach(c => {
    const b = el("button", "pill" + (c === kpiActiveCat ? " active" : ""), c);
    b.addEventListener("click", () => { kpiActiveCat = c; renderKpiPills(); renderKpiGrid(); });
    wrap.appendChild(b);
  });
}

function renderKpiGrid() {
  const wrap = document.getElementById("kpi-grid");
  wrap.innerHTML = "";
  const q = kpiSearch.trim().toLowerCase();
  const bookmarks = getBookmarks();
  const filtered = KPIS.filter(k => {
    const matchCat = kpiActiveCat === "All" || k.cat === kpiActiveCat;
    const matchQ = !q || (k.name + k.formula + k.table + k.desc).toLowerCase().includes(q);
    const matchStar = !kpiStarredOnly || bookmarks.kpi[k.name];
    return matchCat && matchQ && matchStar;
  });
  if (!filtered.length) {
    wrap.appendChild(el("div", "empty-state", kpiStarredOnly ? "No starred KPIs yet — tap the ★ on any card to save it here." : "No KPIs match that search."));
    return;
  }
  filtered.forEach(k => {
    const starred = !!bookmarks.kpi[k.name];
    const c = el("div", "card kpi-card");
    c.id = "kpi-" + slugify(k.name);
    c.innerHTML = `
      <div class="top">
        <h4>${k.name}</h4>
        <div class="card-top-actions">
          <span class="tag ${k.prio === 'P1' ? 'p1' : 'p2'}">${k.prio}</span>
          <button class="link-btn" title="Copy link to this KPI" data-link-kpi="${k.name}">🔗</button>
          <button class="star-btn ${starred ? 'starred' : ''}" title="Star this KPI" data-star-kpi="${k.name}">${starred ? '★' : '☆'}</button>
        </div>
      </div>
      <p style="font-size:12.5px;color:var(--ink-muted);margin:0;">${k.desc}</p>
      <div class="formula">${k.formula}</div>
      ${k.note ? `<div class="kpi-note">⚠️ ${k.note}</div>` : ""}
      <div class="meta"><span>${k.table}</span><span>${k.cat}</span></div>
    `;
    wrap.appendChild(c);
  });
  wrap.querySelectorAll("[data-star-kpi]").forEach(btn => {
    btn.addEventListener("click", () => {
      toggleBookmark("kpi", btn.dataset.starKpi);
      renderKpiGrid();
    });
  });
  wrap.querySelectorAll("[data-link-kpi]").forEach(btn => {
    btn.addEventListener("click", () => copyDeepLink("kpi", btn.dataset.linkKpi));
  });
}

function renderModel() {
  const schema = document.getElementById("schema-grid");
  TABLES.forEach(t => {
    const isFact = t.type.toLowerCase().includes("fact");
    const node = el("div", "table-node" + (isFact ? " fact" : "") + (t.center ? " center" : ""));
    node.innerHTML = `
      <div class="hd"><span>${t.name}</span><span>${t.rows}</span></div>
      <div class="bd">
        <div><span class="pk">${t.pk}</span> · PK</div>
        <div>FK: ${t.fk}</div>
        <div style="margin-top:4px;opacity:.85;">${t.type}</div>
      </div>`;
    schema.appendChild(node);
  });

  const rel = document.getElementById("rel-list");
  rel.innerHTML = `<h4 style="font-size:15px;margin-bottom:6px;">Relationships</h4>`;
  RELATIONSHIPS.forEach(r => {
    const d = el("div", "r");
    d.innerHTML = `<span class="card-arrow">↳</span><span>${r}</span>`;
    rel.appendChild(d);
  });

  document.getElementById("load-order").innerHTML = LOAD_ORDER.map(x => `<div style="padding:5px 0;">${x}</div>`).join("");
  document.getElementById("null-notes").innerHTML = NULL_NOTES.map(x => `<div style="padding:5px 0;">${x}</div>`).join("");
  document.getElementById("calc-fields").innerHTML = CALC_FIELDS.map(x => `<div style="padding:5px 0;">${x}</div>`).join("");
  const gotchaWrap = document.getElementById("gotchas-list");
  if (gotchaWrap) {
    gotchaWrap.innerHTML = GOTCHAS.map(g => `
      <div class="gotcha-card">
        <div class="gotcha-title">⚠️ ${g.t}</div>
        <div class="gotcha-desc">${g.d}</div>
      </div>
    `).join("");
  }

  const gf = document.getElementById("global-filters");
  if (gf) {
    gf.innerHTML = GLOBAL_FILTERS.map(([name, src]) =>
      `<div style="display:flex;justify-content:space-between;gap:16px;padding:7px 0;border-top:1px solid var(--line-soft);"><span style="font-weight:600;color:var(--ink);">${name}</span><span style="font-family:var(--mono);font-size:12px;">${src}</span></div>`
    ).join("");
  }

  const jg = document.getElementById("join-guide-table");
  jg.innerHTML = `
    <thead><tr><th>Type</th><th>Table</th><th>Primary Key</th><th>Foreign Keys</th><th>Joins To</th><th>Grain / Notes</th></tr></thead>
    <tbody>${JOIN_GUIDE.map(r => `<tr>${r.map(c => `<td>${c}</td>`).join("")}</tr>`).join("")}</tbody>
  `;
  const jp = document.getElementById("join-paths-table");
  jp.innerHTML = `
    <thead><tr><th>Join Name</th><th>Full Join Expression</th></tr></thead>
    <tbody>${JOIN_PATHS.map(r => `<tr><td>${r[0]}</td><td><code>${r[1]}</code></td></tr>`).join("")}</tbody>
  `;

  const t = document.getElementById("dash-table");
  t.innerHTML = `
    <thead><tr><th>#</th><th>Dashboard</th><th>Audience</th><th>Primary KPIs</th><th>Key Visuals</th></tr></thead>
    <tbody>${DASHBOARDS.map(r => `<tr>${r.map(c => `<td>${c}</td>`).join("")}</tr>`).join("")}</tbody>
  `;
}

function renderDataDictionary(filterText) {
  const wrap = document.getElementById("datadict-tables");
  if (!wrap) return;
  const q = (filterText || "").trim().toLowerCase();
  wrap.innerHTML = "";

  DATA_DICTIONARY.forEach(t => {
    const rows = t.cols.filter(([col, type, desc, notes]) =>
      !q || (col + type + desc + notes).toLowerCase().includes(q)
    );
    if (!rows.length) return;

    const card = el("div", "card dd-table-card table-scroll");
    card.innerHTML = `
      <div class="hd"><h4>${t.table}</h4><span class="tag p2">${t.rows}</span></div>
      <table class="dtable">
        <thead><tr><th>Column</th><th>Type</th><th>Description</th><th>Notes</th></tr></thead>
        <tbody>${rows.map(([col, type, desc, notes]) => `
          <tr><td>${col}</td><td><span class="col-type">${type}</span></td><td>${desc}</td><td>${notes}</td></tr>
        `).join("")}</tbody>
      </table>
    `;
    wrap.appendChild(card);
  });

  if (!wrap.children.length) {
    wrap.appendChild(el("div", "empty-state", "No columns match that search."));
  }
}

function renderDashboardMocks() {
  const wrap = document.getElementById("dashboard-mocks");
  wrap.innerHTML = DASH_MOCKS.map(renderDashMock).join("");
}

function renderSql() {
  const wrap = document.getElementById("sql-list");
  SQL_BLOCKS.forEach((b, i) => {
    const c = el("div", "card sql-block");
    c.innerHTML = `
      <div class="hd">
        <div><h4>${b.title}</h4><p>${b.desc}</p></div>
        <button class="copy-btn" data-idx="${i}">Copy</button>
      </div>
      <pre>${b.sql.replace(/</g,"&lt;")}</pre>
    `;
    wrap.appendChild(c);
  });
  wrap.querySelectorAll(".copy-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const idx = +btn.dataset.idx;
      navigator.clipboard.writeText(SQL_BLOCKS[idx].sql).then(() => {
        btn.textContent = "Copied ✓";
        btn.classList.add("copied");
        setTimeout(() => { btn.textContent = "Copy"; btn.classList.remove("copied"); }, 1600);
      });
    });
  });
}

/* ---- Interview prep state ---- */
let qaActiveCat = "Explain This Project";
let qaSearch = "";
let qaStarredOnly = false;
const PROGRESS_KEY = "shodwe_prep_progress_v1";
function getProgress() {
  try { return JSON.parse(localStorage.getItem(PROGRESS_KEY)) || {}; } catch(e) { return {}; }
}
function setProgressItem(id, done) {
  const p = getProgress();
  p[id] = done;
  localStorage.setItem(PROGRESS_KEY, JSON.stringify(p));
}

function renderQaTabs() {
  const wrap = document.getElementById("qa-tabs");
  wrap.innerHTML = "";
  QA_CATS.forEach(c => {
    const count = QA.filter(q => q.cat === c).length;
    const b = el("button", c === qaActiveCat ? "active" : "", `${c} (${count})`);
    b.addEventListener("click", () => { qaActiveCat = c; renderQaTabs(); renderQaList(); });
    wrap.appendChild(b);
  });
}

function renderQaList() {
  const wrap = document.getElementById("qa-list");
  wrap.innerHTML = "";
  const progress = getProgress();
  const bookmarks = getBookmarks();
  const q = qaSearch.trim().toLowerCase();
  const filtered = QA.filter(item => {
    const matchCat = !q ? item.cat === qaActiveCat : true;
    const matchQ = !q || (item.q + item.a).toLowerCase().includes(q);
    const matchStar = !qaStarredOnly || bookmarks.qa[item.q];
    return matchCat && matchQ && matchStar;
  });

  updateProgressBar();

  if (!filtered.length) {
    wrap.appendChild(el("div", "empty-state", qaStarredOnly ? "No starred questions yet — tap the ★ on any question to save it here." : "No questions match that search."));
    return;
  }

  filtered.forEach((item) => {
    const id = item.cat + "::" + item.q;
    const done = !!progress[id];
    const starred = !!bookmarks.qa[item.q];
    const isLong = item.a.length > 480;
    const card = el("div", "qa-item");
    card.id = "qa-" + slugify(item.q);
    card.innerHTML = `
      <div class="qa-q">
        <span class="num">${item.cat}</span>
        <span class="qtext">${item.q}</span>
        <button class="link-btn" title="Copy link to this question" data-link-qa="${item.q.replace(/"/g,'&quot;')}">🔗</button>
        <button class="star-btn ${starred ? 'starred' : ''}" title="Star this question" data-star-qa="${item.q.replace(/"/g,'&quot;')}">${starred ? '★' : '☆'}</button>
        <span class="chev">⌄</span>
      </div>
      <div class="qa-a"><div class="qa-a-inner">
        <div class="answer-text ${isLong ? 'clamped' : ''}"><p>${item.a}</p></div>
        ${isLong ? '<button type="button" class="show-full-btn">Show full answer ▾</button>' : ''}
        <div class="signal">Interviewer signal: ${item.signal}</div>
        <button class="mark-btn ${done ? 'done' : ''}" style="margin-top:12px;">${done ? '✓ Reviewed' : 'Mark reviewed'}</button>
      </div></div>
    `;
    const qBtn = card.querySelector(".qa-q");
    const aDiv = card.querySelector(".qa-a");
    qBtn.addEventListener("click", (ev) => {
      if (ev.target.closest(".star-btn") || ev.target.closest(".link-btn")) return;
      const isOpen = card.classList.toggle("open");
      aDiv.style.maxHeight = isOpen ? aDiv.scrollHeight + "px" : "0px";
    });
    const showFullBtn = card.querySelector(".show-full-btn");
    if (showFullBtn) {
      showFullBtn.addEventListener("click", (ev) => {
        ev.stopPropagation();
        const textDiv = card.querySelector(".answer-text");
        const nowClamped = textDiv.classList.toggle("clamped");
        showFullBtn.textContent = nowClamped ? "Show full answer ▾" : "Show less ▴";
        if (card.classList.contains("open")) aDiv.style.maxHeight = aDiv.scrollHeight + "px";
      });
    }
    const markBtn = card.querySelector(".mark-btn");
    markBtn.addEventListener("click", (ev) => {
      ev.stopPropagation();
      const nowDone = !markBtn.classList.contains("done");
      setProgressItem(id, nowDone);
      markBtn.classList.toggle("done", nowDone);
      markBtn.textContent = nowDone ? "✓ Reviewed" : "Mark reviewed";
      updateProgressBar();
    });
    const starBtn = card.querySelector(".star-btn");
    starBtn.addEventListener("click", (ev) => {
      ev.stopPropagation();
      toggleBookmark("qa", item.q);
      renderQaList();
    });
    const linkBtnEl = card.querySelector(".link-btn");
    linkBtnEl.addEventListener("click", (ev) => {
      ev.stopPropagation();
      copyDeepLink("qa", item.q);
    });
    wrap.appendChild(card);
  });
}

function updateProgressBar() {
  const progress = getProgress();
  const total = QA.length;
  const done = QA.filter(item => progress[item.cat + "::" + item.q]).length;
  const pct = total ? Math.round((done / total) * 100) : 0;
  const progressText = document.getElementById("progress-text");
  const progressBar = document.getElementById("progress-bar");
  if (progressText) progressText.textContent = `${done} / ${total} reviewed`;
  if (progressBar) progressBar.style.width = total ? `${pct}%` : "0%";

  const sideFill = document.getElementById("sidebar-progress-fill");
  const sideCaption = document.getElementById("sidebar-progress-caption");
  if (sideFill) sideFill.style.width = `${pct}%`;
  if (sideCaption) sideCaption.textContent = `${pct}% complete · ${done}/${total} questions reviewed`;
}

function renderGlossary(filterText) {
  const wrap = document.getElementById("gloss-grid");
  const q = (filterText || "").trim().toLowerCase();
  wrap.innerHTML = "";
  const filtered = GLOSSARY.filter(g => !q || (g.t + g.d).toLowerCase().includes(q));
  if (!filtered.length) {
    wrap.appendChild(el("div", "empty-state", "No terms match that search."));
    return;
  }
  filtered.forEach(g => {
    const c = el("div", "card gloss-card");
    c.id = "gl-" + slugify(g.t);
    c.innerHTML = `<h4>${g.t}</h4><p>${g.d}</p>`;
    wrap.appendChild(c);
  });
}

const WEAK_STRONG = [
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

function renderWeakStrong() {
  const wrap = document.getElementById("weak-strong-list");
  if (!wrap) return;
  wrap.innerHTML = WEAK_STRONG.map(ws => `
    <div class="ws-card">
      <div class="ws-q">${ws.q}</div>
      <div class="ws-grid">
        <div class="ws-col ws-weak"><div class="ws-label">✗ Weak answer</div><p>${ws.weak}</p></div>
        <div class="ws-col ws-strong"><div class="ws-label">✓ Strong answer</div><p>${ws.strong}</p></div>
      </div>
    </div>
  `).join("");
}

function renderTips() {
  const wrap = document.getElementById("tip-grid");
  TIPS.forEach(t => {
    const c = el("div", "card tip-card");
    c.innerHTML = `<div class="n">${t.n}</div><h4>${t.h}</h4><p>${t.p}</p>`;
    wrap.appendChild(c);
  });
  document.getElementById("tip-callout").textContent = TIP_CALLOUT;
  renderWeakStrong();
}

/* ---- Nav (sidebar) ---- */
const LAST_VIEW_KEY = "shodwe_last_view_v1";
const VIEW_LABELS = {
  rules: "Rules & Regulations", kpis: "KPI List", model: "Data Model", datadict: "Data Dictionary",
  dashboards: "Sample Dashboards", sql: "SQL & QA Lab", interview: "Interview Prep", glossary: "Glossary", tips: "Student Tips",
};

function switchView(viewName) {
  document.querySelectorAll("#nav button").forEach(x => x.classList.remove("active"));
  const target = document.querySelector(`#nav button[data-view="${viewName}"]`);
  if (target) target.classList.add("active");
  document.querySelectorAll("section.view").forEach(v => v.classList.remove("active"));
  const section = document.getElementById("view-" + viewName);
  if (section) section.classList.add("active");
  window.scrollTo({ top: 0, behavior: "auto" });
  closeMobileSidebar();
  if (viewName !== "overview" && VIEW_LABELS[viewName]) {
    try { localStorage.setItem(LAST_VIEW_KEY, JSON.stringify({ view: viewName, ts: Date.now() })); } catch (e) {}
  }
  if (viewName === "overview") renderContinueBanner();
}

function renderContinueBanner() {
  const wrap = document.getElementById("continue-banner");
  if (!wrap) return;
  let saved = null;
  try { saved = JSON.parse(localStorage.getItem(LAST_VIEW_KEY)); } catch (e) {}
  if (!saved || !saved.view || !VIEW_LABELS[saved.view]) { wrap.style.display = "none"; return; }
  wrap.style.display = "flex";
  wrap.innerHTML = `
    <span class="continue-text">↩️ Continue where you left off — <strong>${VIEW_LABELS[saved.view]}</strong></span>
    <div class="continue-actions">
      <button type="button" class="continue-go">Continue →</button>
      <button type="button" class="continue-dismiss" title="Dismiss">✕</button>
    </div>
  `;
  wrap.querySelector(".continue-go").addEventListener("click", () => switchView(saved.view));
  wrap.querySelector(".continue-dismiss").addEventListener("click", () => { wrap.style.display = "none"; });
}

function initNav() {
  document.querySelectorAll("#nav button").forEach(b => {
    b.addEventListener("click", () => switchView(b.dataset.view));
  });
  document.querySelectorAll("[data-goto]").forEach(b => {
    b.addEventListener("click", () => switchView(b.dataset.goto));
  });
}

function closeMobileSidebar() {
  const sidebar = document.getElementById("sidebar");
  const scrim = document.getElementById("scrim");
  if (sidebar) sidebar.classList.remove("open");
  if (scrim) scrim.classList.remove("show");
}

function initMobileToggle() {
  const toggle = document.getElementById("mobile-toggle");
  const sidebar = document.getElementById("sidebar");
  const scrim = document.getElementById("scrim");
  if (!toggle || !sidebar || !scrim) return;
  toggle.addEventListener("click", () => {
    sidebar.classList.toggle("open");
    scrim.classList.toggle("show");
  });
  scrim.addEventListener("click", closeMobileSidebar);
}

/* ---- Footer / sidebar / hero social links ---- */
function initSocial() {
  const map = [
    ["side-youtube", SOCIAL.youtube], ["side-medium", SOCIAL.medium], ["side-linkedin", SOCIAL.linkedin],
    ["social-youtube", SOCIAL.youtube], ["social-medium", SOCIAL.medium], ["social-linkedin", SOCIAL.linkedin],
    ["youtube-link", SOCIAL.youtube],
  ];
  map.forEach(([id, url]) => {
    const el = document.getElementById(id);
    if (el && url) el.href = url;
  });
  const footerLinks = document.querySelectorAll(".footer-links a");
  if (footerLinks[0]) footerLinks[0].href = SOCIAL.linkedin;
  if (footerLinks[1]) footerLinks[1].href = SOCIAL.medium;
}

/* ---- Visitor counter ---- */
function initVisitorCounter() {
  const el = document.getElementById("visitor-count");
  if (!el) return;
  const namespace = "shodwe-hospitality-analytics-mahendra-singh";
  const key = "site-visits";
  fetch(`https://api.countapi.xyz/hit/${namespace}/${key}`)
    .then(r => r.json())
    .then(data => {
      if (data && typeof data.value === "number") {
        el.textContent = data.value.toLocaleString("en-US");
      } else {
        throw new Error("bad response");
      }
    })
    .catch(() => {
      let local = parseInt(localStorage.getItem("shodwe_local_visits") || "0", 10);
      local += 1;
      localStorage.setItem("shodwe_local_visits", String(local));
      el.textContent = local.toLocaleString("en-US");
    });
}

/* ---- Search bindings ---- */
function initSearch() {
  document.getElementById("kpi-search").addEventListener("input", (e) => {
    kpiSearch = e.target.value;
    renderKpiGrid();
  });
  document.getElementById("qa-search").addEventListener("input", (e) => {
    qaSearch = e.target.value;
    renderQaList();
  });
  document.getElementById("gl-search").addEventListener("input", (e) => {
    renderGlossary(e.target.value);
  });
  document.getElementById("dd-search").addEventListener("input", (e) => {
    renderDataDictionary(e.target.value);
  });
}

/* ============================================================
   Ask SIA — chat widget
   Pure client-side keyword search over KPIS, QA and GLOSSARY —
   no API key, no external service, no message limits.
   ============================================================ */

function buildChatIndex() {
  const idx = [];
  KPIS.forEach(k => {
    idx.push({
      type: "KPI", tab: "kpis",
      title: k.name,
      text: `${k.name} ${k.desc} ${k.formula} ${k.table} ${k.cat}`,
      answer: `<strong>${k.name}</strong> (${k.cat}) — ${k.desc}<br><span class="src-tag">${k.formula}</span>`,
      followups: ["How is it different from ADR?", "Show related SQL question", "Which table does this come from?"],
    });
  });
  QA.forEach(item => {
    idx.push({
      type: "Interview Q&A", tab: "interview",
      title: item.q,
      text: `${item.q} ${item.a} ${item.cat}`,
      answer: `<strong>${item.q}</strong><br>${item.a}<div class="chat-signal">Interviewer signal: ${item.signal}</div>`,
      followups: item.cat === "Scenario-Based"
        ? ["Give me another scenario question", "What's a common gotcha here?"]
        : ["Give me a scenario question on this", "What's a common mistake here?"],
    });
  });
  GLOSSARY.forEach(g => {
    idx.push({
      type: "Glossary", tab: "glossary",
      title: g.t,
      text: `${g.t} ${g.d}`,
      answer: `<strong>${g.t}</strong> — ${g.d}`,
      followups: ["Show the related KPI", "Any gotchas here?"],
    });
  });
  NULL_NOTES.forEach((n, i) => {
    idx.push({
      type: "Data Model", tab: "model",
      title: `Data Model note ${i + 1}`,
      text: `null notes expected nulls quirks data quality ${n}`,
      answer: `<strong>Data Model — expected null / quirk</strong><br>${n}`,
      followups: ["What are the other data model gotchas?", "Open the Data Model tab"],
    });
  });
  GOTCHAS.forEach(g => {
    idx.push({
      type: "Gotcha", tab: "model",
      title: g.t,
      text: `gotcha trap mistake ${g.t} ${g.d}`,
      answer: `<strong>⚠️ Gotcha — ${g.t}</strong><br>${g.d}`,
      followups: ["What's another gotcha?", "Give me an interview question on this"],
    });
  });
  TIPS.forEach(t => {
    idx.push({
      type: "Student Tip", tab: "tips",
      title: t.h,
      text: `tip advice ${t.h} ${t.p}`,
      answer: `<strong>Tip — ${t.h}</strong><br>${t.p}`,
      followups: ["Give me another tip", "Open Student Tips"],
    });
  });
  return idx;
}

const STOPWORDS = new Set(["what","is","the","a","an","of","for","how","why","does","do","in","on","to","and","or","this","that","are","was","were","be","it","its","with","vs","versus","between","me","tell","explain","about"]);

// Synonym map — student phrasing → the terms actually used in the site's data.
const SYNONYMS = {
  "cancel": ["cancellation", "cancelled", "canceled"],
  "cancelled": ["cancellation", "cancel"],
  "noshow": ["no show", "no-show"],
  "revenue": ["revenue_realized", "revenue_generated"],
  "occupancy": ["occupied", "occ"],
  "join": ["composite key", "relationship", "grain"],
  "grain": ["composite key", "join"],
  "weekend": ["day_type", "friday", "saturday"],
  "dax": ["measure", "calculated column", "power bi"],
  "sql": ["query", "select"],
  "star schema": ["fact table", "dimension table", "data model"],
  "trap": ["gotcha", "mistake", "trick"],
  "mistake": ["gotcha", "trap"],
  "rate": ["adr", "pricing"],
  "room nights": ["stay_duration", "length of stay", "los"],
  "los": ["length of stay", "stay_duration", "room nights"],
  "rls": ["row level security"],
  "gop": ["profit", "gross operating profit"],
  "profit": ["gop", "gross operating profit"],
};

function expandTokens(tokens) {
  const extra = [];
  tokens.forEach(t => { if (SYNONYMS[t]) extra.push(...SYNONYMS[t]); });
  return tokens.concat(extra.map(s => s.toLowerCase()));
}

function tokenize(s) {
  return s.toLowerCase().replace(/[^a-z0-9%\s]/g, " ").split(/\s+/).filter(w => w && !STOPWORDS.has(w));
}

// Hard intent rules — fire before the generic keyword search, for the
// handful of questions students ask constantly and phrase very differently.
const INTENT_RULES = [
  { re: /revpar|revenue per available/i, title: "RevPAR (Revenue Per Available Room)" },
  { re: /\badr\b|average daily rate/i, title: "ADR (Average Daily Rate)" },
  { re: /two fact|why two|second fact table/i, title: "Why does this dataset include both fact_bookings and a separate fact_aggregated_bookings table — isn't that redundant?" },
  { re: /weekend|day_type|friday.*saturday/i, title: "Friday + Saturday = \"Weekend\"" },
  { re: /scenario|gm (said|calls)|stakeholder/i, title: "The GM of Shodwe Grands Delhi calls you at 9 AM. \"Occupancy last week was 92% but my revenue is lower than the week when occupancy was only 78%. Explain this to me in simple terms and show me the numbers.\"" },
  { re: /composite key|three.column|3.column join/i, title: "Composite key" },
  { re: /adr.*room night|room night.*adr|adr definition|true adr/i, title: "ADR: bookings vs room nights — the classic trap" },
  { re: /occupancy.*realisation|realisation.*occupancy/i, title: "What's the difference between Occupancy % and Realisation %? They sound similar." },
  { re: /ratings?_?given|ratings? null|58%.*rating|rating.*null/i, title: "How do you handle the fact that ratings_given is null on roughly 58% of rows?" },
];

function findByExactTitle(title, index) {
  return index.find(e => e.title === title);
}

function searchChatIndex(query, index) {
  const qTokensRaw = tokenize(query);
  if (!qTokensRaw.length) return [];
  const qTokens = expandTokens(qTokensRaw);
  const queryLower = query.toLowerCase();

  const scored = index.map(entry => {
    const textLower = entry.text.toLowerCase();
    const titleLower = entry.title.toLowerCase();
    let score = 0;
    qTokens.forEach(tok => {
      if (titleLower.includes(tok)) score += 3;
      else if (textLower.includes(tok)) score += 1;
    });
    // Exact-phrase bonus: reward entries where the whole query (3+ chars) appears verbatim
    if (queryLower.length > 3 && titleLower.includes(queryLower)) score += 5;
    return { entry, score };
  }).filter(r => r.score > 0);
  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, 3).map(r => r.entry);
}

let chatIndexCache = null;
let chatHistory = []; // last few user turns, for lightweight "why?" / "give an example" follow-ups
let chatLastResults = [];

function chatAppendMessage(html, who) {
  const body = document.getElementById("chat-panel-body");
  const row = el("div", "chat-msg " + who);
  row.innerHTML = `<div class="chat-bubble">${html}</div>`;
  body.appendChild(row);
  body.scrollTop = body.scrollHeight;
  return row;
}

function chatAppendFollowups(followups, body) {
  if (!followups || !followups.length) return;
  const wrap = el("div", "chat-followups");
  followups.slice(0, 3).forEach(f => {
    const chip = el("button", "chat-followup-chip", f);
    chip.type = "button";
    chip.addEventListener("click", () => {
      chatAppendMessage(f.replace(/</g, "&lt;"), "user");
      setTimeout(() => chatAnswer(f), 150);
    });
    wrap.appendChild(chip);
  });
  body.appendChild(wrap);
  body.scrollTop = body.scrollHeight;
}

function chatTypingIndicator(show) {
  const body = document.getElementById("chat-panel-body");
  let indEl = document.getElementById("chat-typing-indicator");
  if (show) {
    if (indEl) return;
    indEl = el("div", "chat-msg bot");
    indEl.id = "chat-typing-indicator";
    indEl.innerHTML = `<div class="chat-bubble chat-typing"><span></span><span></span><span></span></div>`;
    body.appendChild(indEl);
    body.scrollTop = body.scrollHeight;
  } else if (indEl) {
    indEl.remove();
  }
}

const CHAT_POPULAR = [
  "What is RevPAR?",
  "Why does this dataset have two fact tables?",
  "Occupancy vs Realisation — what's the difference?",
  "Is ADR really Revenue / Bookings?",
  "Why is ratings_given null on so many rows?",
  "Give me a scenario-based question",
];

function chatFallback() {
  const suggestions = CHAT_POPULAR.map(q =>
    `<button type="button" class="chat-followup-chip" data-suggest="${q.replace(/"/g, '&quot;')}">${q}</button>`
  ).join("");
  const body = chatAppendMessage(
    `I couldn't find a close match for that in the KPI list, interview prep, data model or glossary. Try a specific term — e.g. a KPI name, a table name, or one of these:`,
    "bot"
  );
  const wrap = el("div", "chat-followups");
  wrap.innerHTML = suggestions;
  wrap.querySelectorAll("[data-suggest]").forEach(btn => {
    btn.addEventListener("click", () => {
      const q = btn.getAttribute("data-suggest");
      chatAppendMessage(q.replace(/</g, "&lt;"), "user");
      setTimeout(() => chatAnswer(q), 150);
    });
  });
  const container = document.getElementById("chat-panel-body");
  container.appendChild(wrap);
  container.scrollTop = container.scrollHeight;
}

function chatAnswer(query) {
  if (!chatIndexCache) chatIndexCache = buildChatIndex();

  // Very short follow-ups ("why?", "example?") lean on the last thing discussed.
  const bare = query.trim().toLowerCase().replace(/[?!.]/g, "");
  if ((bare === "why" || bare === "example" || bare === "give an example" || bare === "more") && chatLastResults.length) {
    query = chatLastResults[0].title;
  }

  chatHistory.push(query);
  if (chatHistory.length > 3) chatHistory.shift();

  // Hard intent rules fire first for the highest-traffic questions.
  let forced = null;
  for (const rule of INTENT_RULES) {
    if (rule.re.test(query)) {
      forced = findByExactTitle(rule.title, chatIndexCache);
      if (forced) break;
    }
  }

  const results = forced ? [forced] : searchChatIndex(query, chatIndexCache);

  if (!results.length) {
    chatFallback();
    return;
  }

  chatLastResults = results;
  const tabLabel = { kpis: "KPI List", interview: "Interview Prep", glossary: "Glossary", model: "Data Model", tips: "Student Tips" };
  results.forEach((r) => {
    const linkBtn = `<br><button type="button" class="chat-link-btn" onclick="switchView('${r.tab}')">Open ${tabLabel[r.tab] || r.tab} tab →</button>`;
    const copyBtn = `<button type="button" class="chat-copy-btn" title="Copy answer">Copy</button>`;
    const bubbleId = "chat-a-" + Math.random().toString(36).slice(2, 9);
    const body = chatAppendMessage(`<div id="${bubbleId}">${r.answer}</div>${linkBtn}${copyBtn}`, "bot");
    const cBtn = body.querySelector(".chat-copy-btn");
    cBtn.addEventListener("click", () => {
      const text = document.getElementById(bubbleId).innerText;
      navigator.clipboard.writeText(text).then(() => { cBtn.textContent = "Copied ✓"; setTimeout(() => cBtn.textContent = "Copy", 1500); }).catch(() => {});
    });
    chatAppendFollowups(r.followups, document.getElementById("chat-panel-body"));
  });
}

function initChatWidget() {
  const fab = document.getElementById("chat-fab");
  const panel = document.getElementById("chat-panel");
  const closeBtn = document.getElementById("chat-panel-close");
  const form = document.getElementById("chat-panel-form");
  const input = document.getElementById("chat-input");
  const label = document.getElementById("chat-fab-label");
  if (!fab || !panel || !form) return;

  fab.addEventListener("click", () => {
    panel.classList.toggle("open");
    if (panel.classList.contains("open")) {
      input.focus();
      if (label) label.classList.add("hide");
      renderQuickReplies();
    }
  });
  closeBtn.addEventListener("click", () => {
    panel.classList.remove("open");
    if (label) label.classList.remove("hide");
  });

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const q = input.value.trim();
    if (!q) return;
    chatAppendMessage(q.replace(/</g, "&lt;"), "user");
    input.value = "";
    chatTypingIndicator(true);
    setTimeout(() => {
      chatTypingIndicator(false);
      chatAnswer(q);
    }, 450);
  });
}

/* ============================================================
   Shared helpers: slugify + bookmarks + deep links
   ============================================================ */

function slugify(s) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "").slice(0, 60);
}

const BOOKMARK_KEY = "shodwe_bookmarks_v1";
function getBookmarks() {
  try {
    const raw = JSON.parse(localStorage.getItem(BOOKMARK_KEY));
    return raw && raw.kpi && raw.qa ? raw : { kpi: {}, qa: {} };
  } catch (e) { return { kpi: {}, qa: {} }; }
}
function toggleBookmark(type, key) {
  const b = getBookmarks();
  b[type][key] = !b[type][key];
  if (!b[type][key]) delete b[type][key];
  localStorage.setItem(BOOKMARK_KEY, JSON.stringify(b));
}

function copyDeepLink(type, key) {
  const url = `${location.origin}${location.pathname}#${type}=${encodeURIComponent(key)}`;
  navigator.clipboard.writeText(url).then(() => {
    const label = type === "kpi" ? "KPI" : "question";
    chatToastMini(`Link to this ${label} copied — paste it anywhere to jump straight here.`);
  }).catch(() => {});
}

// Tiny non-blocking toast, reused for deep-link copy confirmation
function chatToastMini(msg) {
  let toast = document.getElementById("mini-toast");
  if (!toast) {
    toast = el("div", "", "");
    toast.id = "mini-toast";
    toast.style.cssText = "position:fixed;left:50%;bottom:24px;transform:translateX(-50%);background:var(--ink);color:#fff;padding:10px 18px;border-radius:8px;font-size:12.5px;z-index:1000;box-shadow:0 8px 24px rgba(0,0,0,0.3);opacity:0;transition:opacity 0.25s;";
    document.body.appendChild(toast);
  }
  toast.textContent = msg;
  toast.style.opacity = "1";
  clearTimeout(toast._t);
  toast._t = setTimeout(() => { toast.style.opacity = "0"; }, 2400);
}

function handleDeepLink() {
  const hash = location.hash.slice(1);
  if (!hash) return;
  const [type, rawVal] = hash.split("=");
  if (!type || !rawVal) return;
  const val = decodeURIComponent(rawVal);
  const tabByType = { kpi: "kpis", qa: "interview", gl: "glossary" };
  const tab = tabByType[type];
  if (!tab) return;
  switchView(tab);
  setTimeout(() => {
    let targetId = null;
    if (type === "kpi") targetId = "kpi-" + slugify(val);
    if (type === "qa") targetId = "qa-" + slugify(val);
    if (type === "gl") targetId = "gl-" + slugify(val);
    if (!targetId) return;
    const targetEl = document.getElementById(targetId);
    if (targetEl) {
      targetEl.scrollIntoView({ behavior: "smooth", block: "center" });
      targetEl.classList.add("deep-link-flash");
      if (type === "qa") {
        targetEl.classList.add("open");
        const aDiv = targetEl.querySelector(".qa-a");
        if (aDiv) aDiv.style.maxHeight = aDiv.scrollHeight + "px";
      }
      setTimeout(() => targetEl.classList.remove("deep-link-flash"), 1900);
    }
  }, 120);
}

/* ============================================================
   Dark mode
   ============================================================ */
const THEME_KEY = "shodwe_theme_v1";
function initThemeToggle() {
  const btn = document.getElementById("theme-toggle");
  const icon = document.getElementById("theme-toggle-icon");
  const label = document.getElementById("theme-toggle-label");
  if (!btn) return;
  const saved = localStorage.getItem(THEME_KEY);
  if (saved === "dark") applyTheme(true);
  btn.addEventListener("click", () => {
    const isDark = document.body.classList.contains("dark-mode");
    applyTheme(!isDark);
    localStorage.setItem(THEME_KEY, !isDark ? "dark" : "light");
  });
  function applyTheme(dark) {
    document.body.classList.toggle("dark-mode", dark);
    if (icon) icon.textContent = dark ? "☀️" : "🌙";
    if (label) label.textContent = dark ? "Light mode" : "Dark mode";
  }
}

/* ============================================================
   Study streak tracker
   ============================================================ */
const STREAK_KEY = "shodwe_visit_days_v1";
function updateStreak() {
  const badge = document.getElementById("streak-badge");
  if (!badge) return;
  let days = [];
  try { days = JSON.parse(localStorage.getItem(STREAK_KEY)) || []; } catch (e) { days = []; }
  const today = new Date().toISOString().slice(0, 10);
  if (!days.includes(today)) {
    days.push(today);
    localStorage.setItem(STREAK_KEY, JSON.stringify(days));
  }
  // Count consecutive days ending today
  const daySet = new Set(days);
  let streak = 0;
  let cursor = new Date();
  while (true) {
    const key = cursor.toISOString().slice(0, 10);
    if (daySet.has(key)) {
      streak++;
      cursor.setDate(cursor.getDate() - 1);
    } else break;
  }
  badge.innerHTML = `<span class="flame">🔥</span> <b>${streak}</b>-day study streak · ${days.length} total visit${days.length === 1 ? "" : "s"}`;
}

/* ============================================================
   Quiz / Flashcard mode
   ============================================================ */
let quizDeck = [];
let quizIndex = 0;
let quizScore = { good: 0, again: 0 };

function shuffleArray(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function startQuiz() {
  const bookmarks = getBookmarks();
  const starredQs = QA.filter(q => bookmarks.qa[q.q]);
  quizDeck = shuffleArray(starredQs.length >= 5 ? starredQs : QA);
  quizIndex = 0;
  quizScore = { good: 0, again: 0 };
  document.getElementById("quiz-overlay").classList.add("open");
  renderQuizCard();
}

function renderQuizCard() {
  const body = document.getElementById("quiz-body");
  if (quizIndex >= quizDeck.length) {
    const total = quizScore.good + quizScore.again;
    body.innerHTML = `
      <div class="quiz-done">
        <div class="big-score">${quizScore.good} / ${total}</div>
        <p style="color:var(--ink-muted);font-size:13px;margin-bottom:20px;">marked "Got it" this round${total ? "" : " — deck was empty"}.</p>
        <button class="btn-dark" id="quiz-restart">Run again</button>
      </div>`;
    const restartBtn = document.getElementById("quiz-restart");
    if (restartBtn) restartBtn.addEventListener("click", startQuiz);
    return;
  }
  const item = quizDeck[quizIndex];
  const pct = Math.round((quizIndex / quizDeck.length) * 100);
  body.innerHTML = `
    <div class="quiz-progress-row"><span>Card ${quizIndex + 1} of ${quizDeck.length}</span><span>${item.cat}</span></div>
    <div class="quiz-bar-outer"><div class="quiz-bar-inner" style="width:${pct}%;"></div></div>
    <div class="quiz-card-flip" id="quiz-flip">
      <div class="quiz-card-inner">
        <div class="quiz-face">
          <span class="tag-mini">${item.cat}</span>
          <div class="qtxt">${item.q}</div>
          <div class="hint">Tap the card to reveal the answer</div>
        </div>
        <div class="quiz-face quiz-face-back">
          <div class="atxt">${item.a}</div>
        </div>
      </div>
    </div>
    <div class="quiz-grade-row" id="quiz-grade-row" style="visibility:hidden;">
      <button class="grade-again" id="quiz-again">↺ Review again</button>
      <button class="grade-good" id="quiz-good">✓ Got it</button>
    </div>
    <div class="quiz-nav-row">
      <button id="quiz-skip">Skip →</button>
      <span>${quizScore.good} got it · ${quizScore.again} to review</span>
    </div>
  `;
  const flipEl = document.getElementById("quiz-flip");
  const gradeRow = document.getElementById("quiz-grade-row");
  flipEl.addEventListener("click", () => {
    flipEl.classList.toggle("flipped");
    gradeRow.style.visibility = flipEl.classList.contains("flipped") ? "visible" : "hidden";
  });
  document.getElementById("quiz-again").addEventListener("click", (e) => { e.stopPropagation(); quizScore.again++; quizIndex++; renderQuizCard(); });
  document.getElementById("quiz-good").addEventListener("click", (e) => { e.stopPropagation(); quizScore.good++; quizIndex++; renderQuizCard(); });
  document.getElementById("quiz-skip").addEventListener("click", () => { quizIndex++; renderQuizCard(); });
}

function initQuiz() {
  const launchBtn = document.getElementById("quiz-launch-btn");
  const closeBtn = document.getElementById("quiz-close");
  const overlay = document.getElementById("quiz-overlay");
  if (!launchBtn) return;
  launchBtn.addEventListener("click", startQuiz);
  closeBtn.addEventListener("click", () => overlay.classList.remove("open"));
  overlay.addEventListener("click", (e) => { if (e.target === overlay) overlay.classList.remove("open"); });
}

/* ============================================================
   Starred-only toggles (KPI + Interview tabs)
   ============================================================ */
function initStarredToggles() {
  const kpiToggle = document.getElementById("kpi-starred-toggle");
  const qaToggle = document.getElementById("qa-starred-toggle");
  if (kpiToggle) {
    kpiToggle.addEventListener("click", () => {
      kpiStarredOnly = !kpiStarredOnly;
      kpiToggle.classList.toggle("active", kpiStarredOnly);
      renderKpiGrid();
    });
  }
  if (qaToggle) {
    qaToggle.addEventListener("click", () => {
      qaStarredOnly = !qaStarredOnly;
      qaToggle.classList.toggle("active", qaStarredOnly);
      renderQaList();
    });
  }
}

/* ============================================================
   Command palette (Ctrl/Cmd + K)
   ============================================================ */
let cmdkIndex = null;
let cmdkActive = -1;

function buildCmdkIndex() {
  const idx = [];
  const navMap = [
    ["Home", "overview"], ["Rules & Regulations", "rules"], ["KPI List", "kpis"], ["Data Model", "model"],
    ["Data Dictionary", "datadict"], ["Sample Dashboards", "dashboards"], ["SQL & QA Lab", "sql"],
    ["Interview Prep", "interview"], ["Glossary", "glossary"], ["Student Tips", "tips"],
  ];
  navMap.forEach(([label, tab]) => idx.push({ type: "Tab", label: "Go to " + label, tab, action: "nav" }));
  KPIS.forEach(k => idx.push({ type: "KPI", label: k.name, tab: "kpis", action: "kpi", key: k.name }));
  QA.forEach(q => idx.push({ type: "Q&A", label: q.q, tab: "interview", action: "qa", key: q.q }));
  GLOSSARY.forEach(g => idx.push({ type: "Term", label: g.t, tab: "glossary", action: "gl", key: g.t }));
  return idx;
}

function openCmdk() {
  if (!cmdkIndex) cmdkIndex = buildCmdkIndex();
  const overlay = document.getElementById("cmdk-overlay");
  const input = document.getElementById("cmdk-input");
  overlay.classList.add("open");
  input.value = "";
  input.focus();
  renderCmdkResults("");
}
function closeCmdk() {
  document.getElementById("cmdk-overlay").classList.remove("open");
}

function renderCmdkResults(query) {
  const wrap = document.getElementById("cmdk-results");
  const q = query.trim().toLowerCase();
  let results;
  if (!q) {
    results = cmdkIndex.filter(r => r.action === "nav");
  } else {
    results = cmdkIndex.filter(r => r.label.toLowerCase().includes(q)).slice(0, 30);
  }
  cmdkActive = results.length ? 0 : -1;
  if (!results.length) {
    wrap.innerHTML = `<div class="cmdk-empty">No matches — try a different term.</div>`;
    return;
  }
  wrap.innerHTML = results.map((r, i) => `
    <button class="cmdk-item${i === 0 ? " active" : ""}" data-idx="${i}">
      <span class="cmdk-type">${r.type}</span>
      <span class="cmdk-label">${r.label}</span>
    </button>
  `).join("");
  wrap.querySelectorAll(".cmdk-item").forEach(btn => {
    btn.addEventListener("click", () => selectCmdkResult(results[+btn.dataset.idx]));
    btn.addEventListener("mouseenter", () => {
      wrap.querySelectorAll(".cmdk-item").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      cmdkActive = +btn.dataset.idx;
    });
  });
  wrap._results = results;
}

function selectCmdkResult(r) {
  closeCmdk();
  if (r.action === "nav") { switchView(r.tab); return; }
  if (r.action === "kpi") { location.hash = "kpi=" + encodeURIComponent(r.key); handleDeepLink(); return; }
  if (r.action === "qa") { location.hash = "qa=" + encodeURIComponent(r.key); handleDeepLink(); return; }
  if (r.action === "gl") { location.hash = "gl=" + encodeURIComponent(r.key); handleDeepLink(); return; }
}

function initCmdk() {
  const hintBtn = document.getElementById("cmdk-fab-hint");
  const overlay = document.getElementById("cmdk-overlay");
  const input = document.getElementById("cmdk-input");
  if (!overlay) return;

  const isMac = /Mac|iPhone|iPad/.test(navigator.platform || navigator.userAgent);
  const kbdLabel = document.getElementById("cmdk-kbd-label");
  if (kbdLabel && isMac) kbdLabel.textContent = "⌘ K";

  if (hintBtn) hintBtn.addEventListener("click", openCmdk);
  overlay.addEventListener("click", (e) => { if (e.target === overlay) closeCmdk(); });

  document.addEventListener("keydown", (e) => {
    const mod = isMac ? e.metaKey : e.ctrlKey;
    if (mod && e.key.toLowerCase() === "k") {
      e.preventDefault();
      if (overlay.classList.contains("open")) closeCmdk(); else openCmdk();
      return;
    }
    if (!overlay.classList.contains("open")) return;
    if (e.key === "Escape") { closeCmdk(); return; }
    const wrap = document.getElementById("cmdk-results");
    const results = wrap._results || [];
    if (e.key === "ArrowDown") {
      e.preventDefault();
      cmdkActive = Math.min(cmdkActive + 1, results.length - 1);
      highlightCmdkActive();
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      cmdkActive = Math.max(cmdkActive - 1, 0);
      highlightCmdkActive();
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (results[cmdkActive]) selectCmdkResult(results[cmdkActive]);
    }
  });

  input.addEventListener("input", () => renderCmdkResults(input.value));

  function highlightCmdkActive() {
    const wrap = document.getElementById("cmdk-results");
    wrap.querySelectorAll(".cmdk-item").forEach((b, i) => b.classList.toggle("active", i === cmdkActive));
    const activeEl = wrap.querySelector(".cmdk-item.active");
    if (activeEl) activeEl.scrollIntoView({ block: "nearest" });
  }
}

/* ============================================================
   Chat quick-reply chips
   ============================================================ */
const QUICK_REPLY_POOL = [
  "What is RevPAR?",
  "Why two fact tables?",
  "Occupancy vs Realisation?",
  "Explain the day_type rule",
  "Is ADR really Revenue / Bookings?",
  "Why is ratings_given null?",
  "Give me a scenario question",
  "What's a common gotcha here?",
  "Room nights vs bookings?",
  "How do I QA the Occupancy number?",
];
function renderQuickReplies() {
  const wrap = document.getElementById("chat-quick-replies");
  if (!wrap) return;
  const shuffled = [...QUICK_REPLY_POOL].sort(() => Math.random() - 0.5).slice(0, 5);
  wrap.innerHTML = shuffled.map(q => `<button type="button" data-quick="${q.replace(/"/g,'&quot;')}">${q}</button>`).join("");
  wrap.querySelectorAll("button").forEach(btn => {
    btn.addEventListener("click", () => {
      const input = document.getElementById("chat-input");
      chatAppendMessage(btn.dataset.quick, "user");
      setTimeout(() => chatAnswer(btn.dataset.quick), 150);
      input.focus();
    });
  });
}

/* ============================================================
   Printable "starred only" cheat sheet
   ============================================================ */
function initCheatSheet() {
  const btn = document.getElementById("cheatsheet-btn");
  if (!btn) return;
  btn.addEventListener("click", () => {
    const bookmarks = getBookmarks();
    const starredKpis = KPIS.filter(k => bookmarks.kpi[k.name]);
    const starredQa = QA.filter(q => bookmarks.qa[q.q]);
    if (!starredKpis.length && !starredQa.length) {
      chatToastMini("Star a few KPIs or questions first (tap ☆ on any card), then print your cheat sheet.");
      return;
    }
    const sheet = document.getElementById("print-sheet");
    sheet.innerHTML = `
      <h1>ShodweStay — My Cheat Sheet</h1>
      <p style="color:#666;font-size:11px;margin-bottom:16px;">Generated from starred items · ${new Date().toLocaleDateString()}</p>
      ${starredKpis.length ? `<h3>KPIs (${starredKpis.length})</h3>` + starredKpis.map(k => `
        <div class="ps-item"><h4>${k.name}</h4><p>${k.desc}</p><code>${k.formula}</code></div>
      `).join("") : ""}
      ${starredQa.length ? `<h3 style="margin-top:16px;">Interview Questions (${starredQa.length})</h3>` + starredQa.map(q => `
        <div class="ps-item"><h4>${q.q}</h4><p>${q.a}</p></div>
      `).join("") : ""}
    `;
    setTimeout(() => window.print(), 80);
  });
}

/* ---- Boot ---- */
document.addEventListener("DOMContentLoaded", () => {
  renderStats();
  renderProblemStatement();
  renderTools();
  renderDomainPrimer();
  renderDocuments();
  renderFlow();
  renderTimeline();
  renderRules();
  renderKpiPills();
  renderKpiGrid();
  renderModel();
  renderDataDictionary();
  renderDashboardMocks();
  renderSql();
  renderQaTabs();
  renderQaList();
  renderGlossary();
  renderTips();
  initNav();
  initMobileToggle();
  initSearch();
  initSocial();
  initVisitorCounter();
  initChatWidget();
  renderQuickReplies();
  initThemeToggle();
  updateStreak();
  initQuiz();
  initStarredToggles();
  initCmdk();
  initCheatSheet();
  renderContinueBanner();
  handleDeepLink();
  window.addEventListener("hashchange", handleDeepLink);
});
