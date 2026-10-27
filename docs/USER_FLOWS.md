# User flows

Student: role entry → lookup → sample/entered code → personal slot. Invalid/unknown code preserves safe input and shows recovery. Demo student is SE190163.

Lecturer: exams → schedule → search/status/date filter → slot detail → edit → validate → confirmation → update list. Cancel keeps original. Overlaps, invalid calendar dates, end before start and cancelled slots are rejected. A change is not a backend save.

Both: Kịch bản → loading/empty/error → recovery. Change role keeps data in memory; restart resets it.
