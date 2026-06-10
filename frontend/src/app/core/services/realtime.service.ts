import { Injectable, inject, signal, DestroyRef, NgZone } from '@angular/core';
import { Apollo, gql } from 'apollo-angular';
import { Subscription as RxSubscription } from 'rxjs';
import { AuthService } from './auth.service';

const NOTIFICATION_CREATED_SUBSCRIPTION = gql`
  subscription NotificationCreated($userId: Int!) {
    notificationCreated(userId: $userId) {
      id
      userId
      ticketId
      ticket {
        id
        ticketNumber
        title
      }
      type
      title
      message
      isRead
      metadata
      createdAt
    }
  }
`;

const TICKET_STATUS_CHANGED_SUBSCRIPTION = gql`
  subscription TicketStatusChanged($ticketId: Int) {
    ticketStatusChanged(ticketId: $ticketId) {
      ticketId
      ticketNumber
      title
      oldStatus
      newStatus
      changedBy
      timestamp
    }
  }
`;

const TICKET_CREATED_SUBSCRIPTION = gql`
  subscription TicketCreated {
    ticketCreated {
      ticketId
      ticketNumber
      title
      type
      priority
      createdBy
      timestamp
    }
  }
`;

const TICKET_ASSIGNED_SUBSCRIPTION = gql`
  subscription TicketAssigned($userId: Int!) {
    ticketAssigned(userId: $userId) {
      ticketId
      ticketNumber
      title
      assignedToUserId
      assignedToName
      assignedBy
      timestamp
    }
  }
`;

const TICKET_ASSIGNMENT_ACTIVITY_SUBSCRIPTION = gql`
  subscription TicketAssignmentActivity {
    ticketAssignmentActivity {
      ticketId
      ticketNumber
      title
      assignedToUserId
      assignedToName
      assignedBy
      timestamp
    }
  }
`;

export interface TicketStatusChangedEvent {
  ticketId: number;
  ticketNumber: string;
  title: string;
  oldStatus: string;
  newStatus: string;
  changedBy: string;
  timestamp: string;
}

export interface TicketCreatedEvent {
  ticketId: number;
  ticketNumber: string;
  title: string;
  type: string;
  priority: string;
  createdBy: string;
  timestamp: string;
}

export interface TicketAssignedEvent {
  ticketId: number;
  ticketNumber: string;
  title: string;
  assignedToUserId: number;
  assignedToName: string;
  assignedBy: string;
  timestamp: string;
}

export interface NotificationEvent {
  id: number;
  userId: number;
  ticketId?: number;
  ticket?: { id: number; ticketNumber: string; title: string };
  type: string;
  title: string;
  message: string;
  isRead: boolean;
  metadata?: Record<string, unknown>;
  createdAt: string;
}

export interface ActivityFeedItem {
  id: string;
  kind: 'created' | 'assigned' | 'status';
  tagLabel: string;
  tagColor: string;
  headline: string;
  details: string;
  ticketId: number;
  ticketNumber: string;
  timestamp: string;
}

@Injectable({ providedIn: 'root' })
export class RealtimeService {
  private readonly apollo = inject(Apollo);
  private readonly authService = inject(AuthService);
  private readonly ngZone = inject(NgZone);

  private subscriptions: RxSubscription[] = [];

  readonly lastNotification = signal<NotificationEvent | null>(null);
  readonly lastStatusChange = signal<TicketStatusChangedEvent | null>(null);
  readonly lastTicketCreated = signal<TicketCreatedEvent | null>(null);
  readonly lastAssignment = signal<TicketAssignedEvent | null>(null);
  readonly lastAssignmentActivity = signal<TicketAssignedEvent | null>(null);
  readonly activityFeed = signal<ActivityFeedItem[]>([]);
  readonly forceTicketRefresh = signal<string | null>(null);
  readonly connected = signal(false);

  private currentUserRole = signal<string>('');

  setUserRole(role: string): void {
    this.currentUserRole.set(role);
  }

  /** Role-based activity filtering */
  private userCanSeeActivity(item: ActivityFeedItem): boolean {
    const role = this.currentUserRole();
    if (['ADMIN', 'SECRETARY', 'DIRECTOR'].includes(role)) return true;
    if (role === 'MIS_HEAD') return item.details?.includes('MIS') ?? true;
    if (role === 'ITS_HEAD') return item.details?.includes('ITS') ?? true;
    return true;
  }

  triggerTicketRefresh(ticketNumber: string): void {
    this.forceTicketRefresh.set(null);
    this.forceTicketRefresh.set(ticketNumber);
  }

  startListening(): void {
    if (typeof window === 'undefined') return;
    const user = this.authService.currentUser();
    if (!user) return;

    this.stopListening();
    this.setUserRole(user.role);

    console.log('[Realtime] Starting WebSocket subscriptions for user', user.id);
    this.connected.set(true);

    this.subscriptions.push(
      this.apollo
        .subscribe<{ notificationCreated: NotificationEvent }>({
          query: NOTIFICATION_CREATED_SUBSCRIPTION,
          variables: { userId: user.id },
        })
        .subscribe({
          next: ({ data }) => {
            if (data?.notificationCreated)
              this.ngZone.run(() => this.lastNotification.set(data!.notificationCreated));
          },
          error: (err) => console.error('[Realtime] notificationCreated error:', err),
        }),
    );

    this.subscriptions.push(
      this.apollo
        .subscribe<{ ticketStatusChanged: TicketStatusChangedEvent }>({
          query: TICKET_STATUS_CHANGED_SUBSCRIPTION,
        })
        .subscribe({
          next: ({ data }) => {
            if (data?.ticketStatusChanged) {
              this.ngZone.run(() => {
                this.lastStatusChange.set(data!.ticketStatusChanged);
                const activity = this.buildStatusActivity(data!.ticketStatusChanged);
                if (activity && this.userCanSeeActivity(activity)) this.pushActivity(activity);
              });
            }
          },
          error: (err) => console.error('[Realtime] ticketStatusChanged error:', err),
        }),
    );

    this.subscriptions.push(
      this.apollo
        .subscribe<{ ticketCreated: TicketCreatedEvent }>({
          query: TICKET_CREATED_SUBSCRIPTION,
        })
        .subscribe({
          next: ({ data }) => {
            if (data?.ticketCreated) {
              this.ngZone.run(() => {
                this.lastTicketCreated.set(data!.ticketCreated);
                const activity = this.buildCreatedActivity(data!.ticketCreated);
                if (this.userCanSeeActivity(activity)) this.pushActivity(activity);
              });
            }
          },
          error: (err) => console.error('[Realtime] ticketCreated error:', err),
        }),
    );

    this.subscriptions.push(
      this.apollo
        .subscribe<{ ticketAssignmentActivity: TicketAssignedEvent }>({
          query: TICKET_ASSIGNMENT_ACTIVITY_SUBSCRIPTION,
        })
        .subscribe({
          next: ({ data }) => {
            if (data?.ticketAssignmentActivity) {
              this.ngZone.run(() => {
                this.lastAssignmentActivity.set(data.ticketAssignmentActivity);
                const activity = this.buildAssignmentActivity(data.ticketAssignmentActivity);
                if (this.userCanSeeActivity(activity)) this.pushActivity(activity);
              });
            }
          },
          error: (err) => console.error('[Realtime] ticketAssignmentActivity error:', err),
        }),
    );

    this.subscriptions.push(
      this.apollo
        .subscribe<{ ticketAssigned: TicketAssignedEvent }>({
          query: TICKET_ASSIGNED_SUBSCRIPTION,
          variables: { userId: user.id },
        })
        .subscribe({
          next: ({ data }) => {
            if (data?.ticketAssigned)
              this.ngZone.run(() => this.lastAssignment.set(data!.ticketAssigned));
          },
          error: (err) => console.error('[Realtime] ticketAssigned error:', err),
        }),
    );
  }

  stopListening(): void {
    this.subscriptions.forEach((s) => s.unsubscribe());
    this.subscriptions = [];
    this.connected.set(false);
    console.log('[Realtime] WebSocket subscriptions stopped');
  }

  private pushActivity(item: ActivityFeedItem | null): void {
    if (!item) return;
    if (!this.userCanSeeActivity(item)) return;
    this.activityFeed.update((entries) => {
      const nextEntries = [item, ...entries.filter((entry) => entry.id !== item.id)];
      nextEntries.sort(
        (left, right) => new Date(right.timestamp).getTime() - new Date(left.timestamp).getTime(),
      );
      return nextEntries.slice(0, 20);
    });
  }

  private buildCreatedActivity(event: TicketCreatedEvent): ActivityFeedItem {
    return {
      id: `created:${event.ticketId}:${event.timestamp}`,
      kind: 'created',
      tagLabel: 'Created',
      tagColor: 'blue',
      headline: `${event.createdBy} created a new ticket`,
      details: `${event.title} - ${event.type} - ${event.priority} priority`,
      ticketId: event.ticketId,
      ticketNumber: event.ticketNumber,
      timestamp: event.timestamp,
    };
  }

  private buildAssignmentActivity(event: TicketAssignedEvent): ActivityFeedItem {
    return {
      id: `assigned:${event.ticketId}:${event.timestamp}`,
      kind: 'assigned',
      tagLabel: 'Assigned',
      tagColor: 'purple',
      headline: `${event.assignedBy} assigned the ticket to ${event.assignedToName}`,
      details: event.title,
      ticketId: event.ticketId,
      ticketNumber: event.ticketNumber,
      timestamp: event.timestamp,
    };
  }

  private buildStatusActivity(event: TicketStatusChangedEvent): ActivityFeedItem | null {
    if (event.newStatus === 'ASSIGNED') return null;
    return {
      id: `status:${event.ticketId}:${event.timestamp}:${event.newStatus}`,
      kind: 'status',
      tagLabel: 'Status',
      tagColor: this.getStatusActivityColor(event.newStatus),
      headline: `${event.changedBy} moved the ticket to ${this.formatStatus(event.newStatus)}`,
      details: `${event.title} - was ${this.formatStatus(event.oldStatus)}`,
      ticketId: event.ticketId,
      ticketNumber: event.ticketNumber,
      timestamp: event.timestamp,
    };
  }

  private getStatusActivityColor(status: string): string {
    const colors: Record<string, string> = {
      FOR_REVIEW: 'gold',
      REVIEWED: 'blue',
      DIRECTOR_APPROVED: 'cyan',
      IN_PROGRESS: 'processing',
      ON_HOLD: 'warning',
      RESOLVED: 'success',
      CLOSED: 'default',
      CANCELLED: 'error',
    };
    return colors[status] ?? 'default';
  }

  private formatStatus(status: string): string {
    return status.replace(/_/g, ' ');
  }
}
