# Demo video script (2:30)

Setup before recording: run `npm run seed -- --reset`. Open two browser windows side by side: **A** (normal) and **B** (incognito), both on the app. Have a terminal ready with `npm run seed -- --live-only` but not started.

| Time | Show | Say |
| --- | --- | --- |
| 0:00–0:15 | Join dialog in A, type a name, join. | "Hearth is your neighbourhood on a live map. Ask for a hand or lend one. No email, just a first name." |
| 0:15–0:35 | Pan the map, drag the radius slider, tap a category in the Pulse. | "Every pin is a TablesDB row with a point column. This feed is a radius search on a spatial index. The Pulse counts are a groupBy aggregation, done by the database." |
| 0:35–0:50 | Open **⚡ TablesDB** inspector. Scroll a little. | "This inspector shows every query the page runs, live: distanceLessThan, search, groupBy, count." |
| 0:50–1:15 | In A: *Ask or offer* → drop the crosshair → post "Need a ladder for 10 mins". Window B shows the pin drop in. | "Posting writes a row with row-level permissions. Over Realtime it appears for every neighbour in range." |
| 1:15–1:40 | In B: join as a second name, open the post, tap **I can help**. In the inspector: createTransaction → getRow → staged updateRow + createRow → commit. | "Claiming is a transaction. If two people tap at the same moment, one commit conflicts and rolls back, so nobody is double-booked." |
| 1:40–1:55 | Chat a line from B; it appears in A instantly. | "The thread is a one-to-many relationship, loaded in one call with Query.select." |
| 1:55–2:15 | In A: **Done — thank**, 5 stars, note → commit. Switch to **Heroes** tab. | "Completion is one createOperations batch across three tables: status, kudos and the thank-you, all or nothing. Heroes is groupBy plus sum on the kudos table." |
| 2:15–2:30 | Start `--live-only` in the terminal; pins rain in; close on the map. | "Hearth: spatial, full-text, relationships, transactions, operators, aggregations and Realtime, all on Appwrite TablesDB." |
