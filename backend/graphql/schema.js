const {
  GraphQLObjectType,
  GraphQLSchema,
  GraphQLString,
  GraphQLInt,
  GraphQLFloat,
  GraphQLBoolean,
  GraphQLList,
  GraphQLNonNull,
} = require("graphql");

// ==================== TYPES ====================

const FlashMessagesType = new GraphQLObjectType({
  name: "FlashMessages",
  fields: () => ({
    success_msg: { type: new GraphQLList(GraphQLString) },
    error_msg: { type: new GraphQLList(GraphQLString) },
    error: { type: new GraphQLList(GraphQLString) },
  }),
});

const UserSummaryType = new GraphQLObjectType({
  name: "UserSummary",
  fields: () => ({
    _id: { type: GraphQLString },
    name: { type: GraphQLString },
    phone: { type: GraphQLString },
    email: { type: GraphQLString },
    address: { type: GraphQLString },
  }),
});

const PaymentType = new GraphQLObjectType({
  name: "Payment",
  fields: () => ({
    status: { type: GraphQLString },
    amount: { type: GraphQLFloat },
    transactionId: { type: GraphQLString },
  }),
});

const BookingType = new GraphQLObjectType({
  name: "Booking",
  fields: () => ({
    _id: { type: GraphQLString },
    user: { type: UserSummaryType },
    mechanic: { type: GraphQLString },
    problemCategory: { type: GraphQLString },
    description: { type: GraphQLString },
    status: { type: GraphQLString },
    payment: { type: PaymentType },
    requiresTowing: { type: GraphQLBoolean },
    isPriority: { type: GraphQLBoolean },
    createdAt: { type: GraphQLString },
    updatedAt: { type: GraphQLString },
  }),
});

const CertificationType = new GraphQLObjectType({
  name: "Certification",
  fields: () => ({
    name: { type: GraphQLString },
    issuer: { type: GraphQLString },
    year: { type: GraphQLInt },
  }),
});

const MechanicProfileType = new GraphQLObjectType({
  name: "MechanicProfile",
  fields: () => ({
    _id: { type: GraphQLString },
    user: { type: GraphQLString },
    specialization: { type: new GraphQLList(GraphQLString) },
    experience: { type: GraphQLInt },
    rating: { type: GraphQLFloat },
    availability: { type: GraphQLBoolean },
    hourlyRate: { type: GraphQLFloat },
    certifications: { type: new GraphQLList(CertificationType) },
  }),
});

const BookingStatsType = new GraphQLObjectType({
  name: "BookingStats",
  fields: () => ({
    total: { type: GraphQLInt },
    pending: { type: GraphQLInt },
    inProgress: { type: GraphQLInt },
    completed: { type: GraphQLInt },
    cancelled: { type: GraphQLInt },
  }),
});

const DashboardType = new GraphQLObjectType({
  name: "MechanicDashboard",
  fields: () => ({
    title: { type: GraphQLString },
    profile: { type: MechanicProfileType },
    bookings: { type: new GraphQLList(BookingType) },
    stats: { type: BookingStatsType },
    totalEarnings: { type: GraphQLFloat },
    todayEarnings: { type: GraphQLFloat },
    nearbyBookings: { type: new GraphQLList(BookingType) },
    userRequestedJob: { type: new GraphQLList(BookingType) },
    flash: { type: FlashMessagesType },
  }),
});

const ChatType = new GraphQLObjectType({
  name: "Chat",
  fields: () => ({
    _id: { type: GraphQLString },
    booking: { type: GraphQLString },
  }),
});

const BookingDetailType = new GraphQLObjectType({
  name: "BookingDetail",
  fields: () => ({
    booking: { type: BookingType },
    chat: { type: ChatType },
    profile: { type: MechanicProfileType },
    flash: { type: FlashMessagesType },
  }),
});

const HistoryType = new GraphQLObjectType({
  name: "MechanicHistory",
  fields: () => ({
    bookings: { type: new GraphQLList(BookingType) },
    profile: { type: MechanicProfileType },
    flash: { type: FlashMessagesType },
  }),
});

const ProfileDataType = new GraphQLObjectType({
  name: "MechanicProfileData",
  fields: () => ({
    profile: { type: MechanicProfileType },
    flash: { type: FlashMessagesType },
  }),
});

// Analytics types
const EarningsByCategoryType = new GraphQLObjectType({
  name: "EarningsByCategory",
  fields: () => ({
    category: { type: GraphQLString },
    earnings: { type: GraphQLFloat },
    count: { type: GraphQLInt },
  }),
});

const MonthlyEarningsType = new GraphQLObjectType({
  name: "MonthlyEarnings",
  fields: () => ({
    month: { type: GraphQLString },
    earnings: { type: GraphQLFloat },
    jobs: { type: GraphQLInt },
  }),
});

const RepeatCustomerType = new GraphQLObjectType({
  name: "RepeatCustomer",
  fields: () => ({
    name: { type: GraphQLString },
    visits: { type: GraphQLInt },
    totalSpent: { type: GraphQLFloat },
    lastVisit: { type: GraphQLString },
  }),
});

const PerformanceType = new GraphQLObjectType({
  name: "Performance",
  fields: () => ({
    totalJobs: { type: GraphQLInt },
    completedJobs: { type: GraphQLInt },
    cancelledJobs: { type: GraphQLInt },
    completionRate: { type: GraphQLFloat },
    avgRating: { type: GraphQLFloat },
    totalRatings: { type: GraphQLInt },
    totalEarnings: { type: GraphQLFloat },
  }),
});

const AnalyticsType = new GraphQLObjectType({
  name: "MechanicAnalytics",
  fields: () => ({
    earningsByCategory: { type: new GraphQLList(EarningsByCategoryType) },
    monthlyEarnings: { type: new GraphQLList(MonthlyEarningsType) },
    repeatCustomers: { type: new GraphQLList(RepeatCustomerType) },
    performance: { type: PerformanceType },
  }),
});

// ==================== QUERY ====================

const RootQuery = new GraphQLObjectType({
  name: "Query",
  fields: {
    mechanicDashboard: {
      type: DashboardType,
      description: "Get mechanic dashboard data including stats, earnings, bookings, and nearby jobs",
      resolve: async (parent, args, context) => {
        return context.resolvers.getDashboard(context);
      },
    },
    mechanicBooking: {
      type: BookingDetailType,
      description: "Get details of a specific booking by ID",
      args: {
        id: { type: new GraphQLNonNull(GraphQLString) },
      },
      resolve: async (parent, args, context) => {
        return context.resolvers.getBookingDetail(args.id, context);
      },
    },
    mechanicHistory: {
      type: HistoryType,
      description: "Get mechanic's job history",
      resolve: async (parent, args, context) => {
        return context.resolvers.getHistory(context);
      },
    },
    mechanicProfile: {
      type: ProfileDataType,
      description: "Get mechanic's profile data",
      resolve: async (parent, args, context) => {
        return context.resolvers.getProfile(context);
      },
    },
    mechanicAnalytics: {
      type: AnalyticsType,
      description: "Get mechanic's analytics (earnings, performance, repeat customers)",
      resolve: async (parent, args, context) => {
        return context.resolvers.getAnalytics(context);
      },
    },
  },
});

module.exports = new GraphQLSchema({
  query: RootQuery,
});
