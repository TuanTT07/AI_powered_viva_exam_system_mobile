# Architecture

App → feature screen/hook → shared schedule domain. Features: auth/demo-entry, student-schedule, lecturer-schedule. Shared native controls live in components/ui; colors/spacing live in theme.

useDemoSchedule owns a single in-memory array, allowing both roles to see the same change. Pure model functions implement lookup, accent-insensitive filtering, chronological sorting and reschedule validation. Screens never fetch data.

State remains local React state. No global store, Query client or API interface is required for this UI milestone. Replace the hook's source with a real repository when API work is authorized, preserving screen behavior.

Native uses SafeAreaView, ScrollView and Android adjustResize. Native Back walks detail/edit/confirmation before leaving the role. Web preview is a review aid, not native evidence.
