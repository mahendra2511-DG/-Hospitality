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

const CRACKANALYTICS_URL = "https://crackanalytics-mahendra-2026.vercel.app/";


/* ---------------- SETUP & SOFTWARE DOWNLOADS ---------------- */
const SOFTWARE_LINKS = [
  { name: "How to import a CSV into MySQL", desc: "Step-by-step guide — load the dataset before connecting Tableau or Power BI", icon: "🗄️", type: "link", href: "https://medium.com/@mahendraa1188/how-to-import-csv-into-mysql-c3bbce297910" },
  { name: "Tableau Desktop — free download", desc: "Official installer from Tableau (free trial / Public edition)", icon: "📈", type: "link", href: "https://www.tableau.com/products/desktop-free/download" },
  { name: "Power BI Desktop — free download", desc: "Official installer from Microsoft", icon: "⚡", type: "link", href: "https://www.microsoft.com/en-us/download/details.aspx?id=58494" },
];

/* ---------------- INTERVIEW PREP ---------------- */
const QA_CATS = ["Explain This Project", "SQL", "Power BI & DAX", "Tableau", "Data Modeling", "Hospitality Domain", "General & HR", "Rapid Fire"];

const QA = [
  // ---------------- Explain This Project ----------------
  { cat: "Explain This Project", q: "Explain this project to me — what did you actually build?", a: "Structure it as a story: (1) the data — 134,590 real bookings across 25 Shodwe Group hotels in 4 cities over 92 days (May–Jul), plus a 9,200-row pre-aggregated occupancy table; (2) the tools — Excel for first-pass prep, SQL for a mart view, Tableau and Power BI for the dashboard; (3) the challenge you hit and how you solved it; (4) the outcome — a Booking & Occupancy dashboard covering 25 KPIs, from headline Revenue and Occupancy % down to week-over-week trend measures. Keep it under two minutes.", signal: "Almost always the first question — tests structure and communication before anything technical." },
  { cat: "Explain This Project", q: "What was the business problem this project was solving?", a: "Shodwe Group, a big hospitality chain, was building reports manually in Excel per property — leading to inconsistent KPIs, no real-time occupancy/revenue visibility, no centralized cross-property view, untracked weekday/weekend demand patterns, and no visibility into room-category or cancellation trends. One dashboard, backed by a single governed data model, replaces five separate blind spots at once.", signal: "Tests whether you can state the 'why' behind the project, tied to the specific pain points named in the brief." },
  { cat: "Explain This Project", q: "What kind of work did you personally do on this project?", a: "Be specific: which KPI category you built (Revenue, Occupancy & Capacity, Mix Analysis, or the Week-over-Week trend measures), which dashboard visual was yours, and which QA queries you ran. Vague answers like 'I worked on the dashboard' read as someone who watched rather than built.", signal: "Tests whether you can separate your individual contribution from the group's." },
  { cat: "Explain This Project", q: "What data did you use, and where did it come from?", a: "Name the scale precisely: a 5-table hospitality dataset — dim_hotels (25 properties), dim_rooms (4 room classes), dim_date (92 days, May–Jul), fact_bookings (134,590 individual bookings), and fact_aggregated_bookings (9,200 pre-computed occupancy rows) — for an imaginary hotel group called Shodwe. Precision here signals you understand the data, not just the charts built on top of it.", signal: "Tests whether 'hotel booking data' gets replaced with real numbers." },
  { cat: "Explain This Project", q: "Why does this dataset include both fact_bookings and a separate fact_aggregated_bookings table — isn't that redundant?", a: "They answer different questions at different grains. fact_bookings is transactional — one row per individual booking, needed for anything guest-level (ratings, cancellation reasons, booking platform). fact_aggregated_bookings is pre-computed at the property/date/room-type grain specifically to make Occupancy % and RevPAR fast and simple — those two KPIs need 'how many rooms were available' (capacity), a number that doesn't exist anywhere in fact_bookings itself. It's not redundant; it's two different units of analysis serving two different KPI families.", signal: "Tests understanding of why a second, differently-grained fact table exists rather than assuming duplication." },

  // ---------------- SQL ----------------
  { cat: "SQL", q: "How did you connect SQL to Tableau and Power BI in this project?", a: "In both tools you add a new data source and pick the native SQL connector, then supply the server host, port and credentials, choose Import or Live/DirectQuery, and select the mart view — vw_hotel_booking_analysis — rather than the raw fact tables directly.", signal: "Tests whether you actually did the connection yourself." },
  { cat: "SQL", q: "What problem did you face while working on this project, and how did you resolve it?", a: "Name something concrete: e.g. Occupancy % coming out wrong because you joined fact_bookings to fact_aggregated_bookings on property_id and check_in_date alone, silently fanning out rows because room_category wasn't included in the join — the fix was adding the third composite-key column. State the symptom, how you traced it, and the fix.", signal: "The single most common project follow-up after 'explain your project.'" },
  { cat: "SQL", q: "Write a query to find duplicate rows in fact_aggregated_bookings.", a: "GROUP BY the table's composite grain — property_id, check_in_date, room_category — and filter with HAVING COUNT(*) > 1. Since this table has no single-column primary key, this composite grouping IS the duplicate check.", signal: "Tests: GROUP BY / HAVING on a composite grain, not just a single PK." },
  { cat: "SQL", q: "How would you calculate Occupancy % correctly in SQL?", a: "SELECT SUM(successful_bookings) * 100.0 / SUM(capacity) FROM fact_aggregated_bookings — both numerator and denominator come from the same table at the same grain, so no join is even required for the aggregate figure; a join to dim_hotels or dim_date is only needed if you want it sliced by property or date.", signal: "Tests recognizing that a KPI can sometimes be computed without any join at all, when both halves of the ratio live in the same table." },
  { cat: "SQL", q: "Write a query to build the vw_hotel_booking_analysis mart view for this project.", a: "SELECT fb.*, dh.property_name, dh.category, dh.city, dd.\"mmm yy\", dd.\"week no\", dd.day_type, dr.room_id, fab.successful_bookings, fab.capacity FROM fact_bookings fb LEFT JOIN dim_hotels dh ON fb.property_id=dh.property_id LEFT JOIN dim_date dd ON fb.check_in_date=dd.date LEFT JOIN dim_rooms dr ON fb.room_category=dr.room_class LEFT JOIN fact_aggregated_bookings fab ON fb.property_id=fab.property_id AND fb.check_in_date=fab.check_in_date AND fb.room_category=fab.room_category — this is the exact view specified in this project's Data Model.", signal: "Tests whether you can write the actual multi-table join with the correct composite join to fact_aggregated_bookings." },
  { cat: "SQL", q: "How would you implement the day_type business rule (Friday/Saturday = Weekend) in SQL?", a: "CASE WHEN DAYOFWEEK(date) IN (6,7) THEN 'Weekend' ELSE 'Weekday' END — but the exact day numbers depend entirely on your SQL dialect's week-start convention, so the safer pattern is CASE WHEN DAYNAME(date) IN ('Friday','Saturday') THEN 'Weekend' ELSE 'Weekday' END, which sidesteps the numbering ambiguity entirely.", signal: "Tests whether you catch that day-number conventions differ across SQL dialects — a real, easy-to-get-wrong translation of the DAX WEEKDAY() logic." },
  { cat: "SQL", q: "Why can't revenue_realized simply be summed the same way for every booking status?", a: "It already accounts for the difference — the metadata specifies that Cancelled bookings retain only 60% of revenue_generated (40% refunded), while Checked Out and No Show bookings keep 100%. That logic is baked into revenue_realized upstream, so summing it directly is correct; the trap is accidentally summing revenue_generated instead, which would overstate actual revenue by ignoring cancellation refunds entirely.", signal: "Tests whether you understand which of two similarly-named revenue columns to use, and why." },

  // ---------------- Power BI & DAX ----------------
  { cat: "Power BI & DAX", q: "Walk me through building the Occupancy % measure in DAX, exactly as this project's metrics register defines it.", a: "Occupancy % = DIVIDE([Total Successful Bookings], [Total Capacity], 0) — where Total Successful Bookings = SUM(fact_aggregated_bookings[successful_bookings]) and Total Capacity = SUM(fact_aggregated_bookings[capacity]). Using DIVIDE with a 0 fallback avoids a divide-by-zero error when a filtered slice (e.g. one property, one day) has zero capacity rows.", signal: "Tests whether you know the exact DAX pattern from the project's own register, including the safe-division fallback." },
  { cat: "Power BI & DAX", q: "How would you build the Revenue WoW Change % measure, and why does it need variables?", a: "It needs the currently-selected week number (via SELECTEDVALUE or MAX on dim_date[wn]), then two CALCULATE() calls — one for the current week's Revenue, one for the prior week (wn − 1) using FILTER(ALL(dim_date), ...) to break out of the current filter context — then DIVIDE(current, prior) − 1. The variables exist because the 'prior week' calculation needs to reference the same selected week number the 'current week' calculation used, without recalculating it twice or having it drift.", signal: "Tests genuine DAX fluency — time intelligence via ALL()+FILTER() and variables, not just SUM()/COUNT()." },
  { cat: "Power BI & DAX", q: "Why is Realisation % defined as 1 − (Cancellation % + No Show Rate %) instead of directly as Checked Out ÷ Total Bookings?", a: "They're mathematically identical (since Checked Out + Cancelled + No Show = Total Bookings), but writing it as the complement makes the relationship between all three outcome rates explicit on the page — if a stakeholder asks 'why is Realisation only 70%,' the answer is visibly 'because Cancellation is 24.8% and No Show is 5.0%,' not just a standalone number they have to reverse-engineer.", signal: "Tests understanding of a deliberate formula-design choice, not just verifying the math checks out." },
  { cat: "Power BI & DAX", q: "How would you build the day_type calculated column in Power BI, matching this project's exact business rule?", a: "day_type = VAR wkd = WEEKDAY(dim_date[date], 1) RETURN IF(wkd > 5, \"Weekend\", \"Weekday\") — with WEEKDAY(date, 1) returning Sunday=1 through Saturday=7, so wkd > 5 catches exactly Friday (6) and Saturday (7), matching the stakeholder's non-calendar-standard weekend definition.", signal: "Tests whether you can reproduce a specific, non-obvious business rule in DAX exactly as specified, not just 'a weekend flag.'" },
  { cat: "Power BI & DAX", q: "Booking % by Room Class uses ALL(dim_rooms[room_class]) inside its DIVIDE(). What does ALL() do here, and why is it needed?", a: "ALL(dim_rooms[room_class]) removes any existing filter on room_class for that one calculation, so the denominator becomes 'total bookings across every room class' regardless of what the visual is currently filtered to — giving a true percent-of-total. Without ALL(), the denominator would silently match whatever room_class filter is already applied, making every row show 100%.", signal: "Tests understanding of filter context removal — a genuinely common DAX percent-of-total pattern." },

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
  { cat: "Hospitality Domain", q: "What's the difference between Occupancy % and Realisation %? They sound similar.", a: "Occupancy % measures rooms sold against rooms available (57.9% here) — a capacity-utilization metric. Realisation % measures how many of the bookings that were made actually converted into a completed stay, i.e. 1 minus cancellation and no-show rates (70.2% here) — a booking-quality metric. A hotel could have decent occupancy but poor realisation if a lot of bookings get cancelled and quickly rebooked by someone else; the two numbers answer genuinely different questions.", signal: "Tests precision on two metrics that sound similar but measure different things — capacity utilization vs. booking follow-through." },
  { cat: "Hospitality Domain", q: "Why does ADR use Total Bookings as its denominator, but RevPAR uses Total Capacity?", a: "ADR (Average Daily Rate) answers 'how much did we charge per room we actually sold' — so it's scoped to sold rooms only. RevPAR (Revenue Per Available Room) answers 'how much revenue did we generate per room we could have sold, occupied or not' — so it's scoped to total capacity, which is always ≥ bookings. RevPAR is always ≤ ADR for the same period, and the gap between them is effectively a visual proxy for how much occupancy is costing the hotel in unrealized revenue.", signal: "Tests understanding of why two closely-related hospitality metrics use deliberately different denominators." },
  { cat: "Hospitality Domain", q: "Why did the stakeholder define 'weekend' as Friday and Saturday instead of the calendar-standard Saturday and Sunday?", a: "It reflects actual guest behavior for this hotel group's likely customer mix — business and leisure travelers checking in Friday for a weekend stay, checking out Saturday or Sunday — meaning Friday night demand and pricing behaves like a weekend, not a weekday, even though the calendar says otherwise. This is exactly why the BRD calls for KPIs to be defined 'based on feedback from stakeholder' rather than a generic textbook rule — the business context determines the definition, not a convention.", signal: "Tests whether you understand KPI definitions are business decisions, not universal constants." },
  { cat: "Hospitality Domain", q: "The dataset shows 'others' as the single largest booking platform (55,066 of 134,590 bookings) — bigger than any named OTA. What would you do with that finding?", a: "Flag it as a data-quality gap before treating it as an insight — an unnamed 'others' bucket that large (41% of all bookings) likely means the platform-tracking logic isn't capturing every channel correctly, or several smaller platforms are being lumped together. The right next step is asking the source system owner what's actually inside 'others' before making any channel-strategy recommendation based on it.", signal: "Tests whether you scrutinize a suspiciously large catch-all category instead of reporting it at face value." },
  { cat: "Hospitality Domain", q: "How would you explain RevPAR to a hotel GM who's never seen a BI dashboard?", a: "It's the single number that answers 'how much money is each room in my hotel actually making me, on average, whether it's occupied tonight or not.' Unlike ADR, which only counts rooms that sold, RevPAR punishes empty rooms — so a hotel with high prices but low occupancy can have a worse RevPAR than a hotel with slightly lower prices but consistently full rooms, which is exactly the tradeoff a GM needs visibility into.", signal: "Tests translating a formula into a plain-English business implication a non-technical GM would actually act on." },

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
        <p>${item.a}</p>
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

function renderTips() {
  const wrap = document.getElementById("tip-grid");
  TIPS.forEach(t => {
    const c = el("div", "card tip-card");
    c.innerHTML = `<div class="n">${t.n}</div><h4>${t.h}</h4><p>${t.p}</p>`;
    wrap.appendChild(c);
  });
  document.getElementById("tip-callout").textContent = TIP_CALLOUT;
}

/* ---- Nav (sidebar) ---- */
function switchView(viewName) {
  document.querySelectorAll("#nav button").forEach(x => x.classList.remove("active"));
  const target = document.querySelector(`#nav button[data-view="${viewName}"]`);
  if (target) target.classList.add("active");
  document.querySelectorAll("section.view").forEach(v => v.classList.remove("active"));
  const section = document.getElementById("view-" + viewName);
  if (section) section.classList.add("active");
  window.scrollTo({ top: 0, behavior: "auto" });
  closeMobileSidebar();
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
    });
  });
  QA.forEach(item => {
    idx.push({
      type: "Interview Q&A", tab: "interview",
      title: item.q,
      text: `${item.q} ${item.a} ${item.cat}`,
      answer: `<strong>${item.q}</strong><br>${item.a}`,
    });
  });
  GLOSSARY.forEach(g => {
    idx.push({
      type: "Glossary", tab: "glossary",
      title: g.t,
      text: `${g.t} ${g.d}`,
      answer: `<strong>${g.t}</strong> — ${g.d}`,
    });
  });
  return idx;
}

const STOPWORDS = new Set(["what","is","the","a","an","of","for","how","why","does","do","in","on","to","and","or","this","that","are","was","were","be","it","its","with","vs","versus","between","me","tell","explain","about"]);

function tokenize(s) {
  return s.toLowerCase().replace(/[^a-z0-9%\s]/g, " ").split(/\s+/).filter(w => w && !STOPWORDS.has(w));
}

function searchChatIndex(query, index) {
  const qTokens = tokenize(query);
  if (!qTokens.length) return [];
  const scored = index.map(entry => {
    const textLower = entry.text.toLowerCase();
    const titleLower = entry.title.toLowerCase();
    let score = 0;
    qTokens.forEach(tok => {
      if (titleLower.includes(tok)) score += 3;
      else if (textLower.includes(tok)) score += 1;
    });
    return { entry, score };
  }).filter(r => r.score > 0);
  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, 2).map(r => r.entry);
}

let chatIndexCache = null;

function chatAppendMessage(html, who) {
  const body = document.getElementById("chat-panel-body");
  const row = el("div", "chat-msg " + who);
  row.innerHTML = `<div class="chat-bubble">${html}</div>`;
  body.appendChild(row);
  body.scrollTop = body.scrollHeight;
}

function chatAnswer(query) {
  if (!chatIndexCache) chatIndexCache = buildChatIndex();
  const results = searchChatIndex(query, chatIndexCache);
  if (!results.length) {
    chatAppendMessage(
      `I couldn't find a close match for that in the KPI list, interview prep or glossary. Try rephrasing with a specific term — e.g. a KPI name, a table name, or a keyword like "occupancy" or "cancellation".`,
      "bot"
    );
    return;
  }
  results.forEach((r) => {
    const tabLabel = { kpis: "KPI List", interview: "Interview Prep", glossary: "Glossary" }[r.tab];
    const linkBtn = `<br><button type="button" class="chat-link-btn" onclick="switchView('${r.tab}')">Open ${tabLabel} tab →</button>`;
    chatAppendMessage(r.answer + linkBtn, "bot");
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
    setTimeout(() => chatAnswer(q), 150);
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
const QUICK_REPLIES = [
  "What is RevPAR?",
  "Why two fact tables?",
  "Occupancy vs Realisation?",
  "Explain the day_type rule",
];
function renderQuickReplies() {
  const wrap = document.getElementById("chat-quick-replies");
  if (!wrap) return;
  wrap.innerHTML = QUICK_REPLIES.map(q => `<button type="button" data-quick="${q.replace(/"/g,'&quot;')}">${q}</button>`).join("");
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
  handleDeepLink();
  window.addEventListener("hashchange", handleDeepLink);
});
