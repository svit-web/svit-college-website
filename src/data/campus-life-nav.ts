// Tree used by the header mega-dropdown and (optionally) the sidebar.
// Keep in sync with the routes under /campus-life.

export interface NavLeaf {
  label: string;
  path: string;
}
export interface NavGroup {
  label: string;
  path?: string;
  children: (NavLeaf | NavGroup)[];
}

export const campusLifeNav: NavGroup = {
  label: "Campus Life",
  path: "/campus-life",
  children: [
    { label: "Overview", path: "/campus-life" },
    {
      label: "Facilities",
      path: "/campus-life/facilities",
      children: [
        {
          label: "Academic",
          children: [
            { label: "Engineering Labs", path: "/campus-life/facilities/academic/labs" },
            { label: "AC Smart Classrooms", path: "/campus-life/facilities/academic/ac-smart-classes" },
            { label: "Central Library", path: "/campus-life/facilities/academic/library" },
          ],
        },
        {
          label: "Sports Facilities",
          children: [
            { label: "Football Ground", path: "/campus-life/facilities/co-curriculum/ground/football" },
            { label: "Cricket Ground", path: "/campus-life/facilities/co-curriculum/ground/cricket" },
            { label: "Basketball Court", path: "/campus-life/facilities/co-curriculum/basketball" },
            { label: "Badminton Courts", path: "/campus-life/facilities/co-curriculum/badminton" },
            { label: "Pickleball Court", path: "/campus-life/facilities/co-curriculum/pickle" },
            { label: "Volleyball Court", path: "/campus-life/facilities/co-curriculum/volley" },
            { label: "Chess Room", path: "/campus-life/facilities/co-curriculum/sportsroom/chess" },
            { label: "Table Tennis", path: "/campus-life/facilities/co-curriculum/sportsroom/table-tennis" },
            { label: "Carrom Room", path: "/campus-life/facilities/co-curriculum/sportsroom/carrom" },
            { label: "Weightlifting & Gym", path: "/campus-life/facilities/co-curriculum/sportsroom/weightlifting" },
          ],
        },
      ],
    },
    {
      label: "Co-curricular",
      path: "/campus-life/centre",
      children: [
        { label: "Google Developer Groups", path: "/campus-life/centre/gdg" },
        { label: "Centre of Excellence", path: "/campus-life/centre/coe" },
        { label: "ISTE Student Chapter", path: "/campus-life/centre/iste-student" },
        { label: "ISTE Faculty Chapter", path: "/campus-life/centre/iste-faculty" },
        { label: "SC/ST Cell", path: "/campus-life/centre/sc-ist" },
        { label: "IIPC", path: "/campus-life/centre/iipc" },
        { label: "EDC", path: "/campus-life/centre/edc" },
        { label: "SSIP", path: "/campus-life/centre/ssip" },
      ],
    },
    {
      label: "Clubs",
      path: "/campus-life/clubs",
      children: [
        { label: "Praxis", path: "/campus-life/clubs/praxis" },
        { label: "AIMS Club", path: "/campus-life/clubs/aims" },
        { label: "Apexia", path: "/campus-life/clubs/apexia" },
        { label: "CircuitX", path: "/campus-life/clubs/circutx" },
      ],
    },
    {
      label: "Events",
      path: "/campus-life/events",
      children: [
        { label: "TEDx SVIT Vasad", path: "/campus-life/events/tedx" },
        { label: "Spandan", path: "/campus-life/events/spark" },
        { label: "Prakarsh", path: "/campus-life/events/prakarsh" },
        { label: "Malhar", path: "/campus-life/events/malhar" },
      ],
    },
  ],
};
