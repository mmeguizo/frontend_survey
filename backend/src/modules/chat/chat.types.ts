import { gql } from "apollo-server-express";

export const chatTypeDefs = gql`
  enum ChatSessionStatus {
    ACTIVE
    CLOSED
    TICKET_CREATED
  }

  enum ChatMessageRole {
    USER
    ASSISTANT
    SYSTEM
  }

  type ChatSession {
    id: Int!
    userId: Int!
    title: String!
    status: ChatSessionStatus!
    ticketId: Int
    ticket: Ticket
    messages: [ChatMessage!]!
    messageCount: Int
    createdAt: String!
    updatedAt: String!
  }

  type ChatMessage {
    id: Int!
    sessionId: Int!
    role: ChatMessageRole!
    content: String!
    metadata: String
    createdAt: String!
  }

  type ChatResponse {
    reply: String!
    metadata: String
    provider: String
    session: ChatSession!
  }

  input CreateTicketFromChatInput {
    sessionId: Int!
    title: String!
    description: String!
    type: String!
    priority: String
    category: String
    staffNote: String
  }

  type ChatReplyChunk {
    sessionId: Int!
    chunk: String!
    done: Boolean!
    provider: String
  }

  type ChatHealthMetrics {
    totalMessages: Int!
    providerUsage: [ProviderUsageEntry!]!
    totalFallbacks: Int!
    totalFailures: Int!
    averageResponseTimeMs: Float
    fromDate: String!
    toDate: String!
  }

  type ProviderUsageEntry {
    provider: String!
    messageCount: Int!
    fallbackCount: Int!
    failureCount: Int!
    averageResponseTimeMs: Float
  }

  type PromptVersionStats {
    promptVersion: String!
    messageCount: Int!
    averageResponseTimeMs: Float
  }

  type BackfillResult {
    solutionsCreated: Int!
    embeddingsGenerated: Int!
    embeddingsFailed: Int!
  }

  type ChatSessionWithUser {
    id: Int!
    userId: Int!
    user: User!
    title: String!
    status: ChatSessionStatus!
    ticketId: Int
    messageCount: Int
    createdAt: String!
    updatedAt: String!
  }

  extend type Query {
    chatSessions: [ChatSession!]!
    chatSession(id: Int!): ChatSession
    """
    Admin-only: view all chat sessions across all users
    """
    allChatSessions: [ChatSessionWithUser!]!
    """
    Admin-only: get AI chat health metrics for the last N days
    """
    chatHealthMetrics(days: Int! = 7): ChatHealthMetrics!
    """
    Admin-only: get prompt version stats for the last N days
    """
    chatPromptVersionStats(days: Int! = 30): [PromptVersionStats!]!
  }

  extend type Mutation {
    createChatSession(title: String): ChatSession!
    sendChatMessage(sessionId: Int!, message: String!): ChatResponse!
    createTicketFromChat(input: CreateTicketFromChatInput!): Ticket!
    deleteChatSession(id: Int!): Boolean!
    backfillSolutionEmbeddings: BackfillResult!
  }

  extend type Subscription {
    """
    Stream chat reply chunks for real-time partial response display.
    The client subscribes before sending a message and unsubscribes when done=true.
    """
    chatReplyStream(sessionId: Int!, message: String!): ChatReplyChunk!
  }
`;
