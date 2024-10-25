import type DomainEvent from '@src/domain/eventBus/domainEvent';
import type { DomainEventSubscriber } from '@src/domain/eventBus/domainEventSubscriber';
import type { EventBus } from '@src/domain/eventBus/eventBus';

export default class InMemorySyncEventBus implements EventBus {
    // biome-ignore lint/complexity/noBannedTypes: <explanation>
    private readonly subscriptions: Map<string, Function[]> = new Map();

    async publish(events: DomainEvent[]): Promise<void> {
        const executions: Promise<void>[] = [];

        for (const e of events) {
            const subscribers = this.subscriptions.get(e.eventName);

            if (subscribers) {
                subscribers.map((subscriber) => executions.push(subscriber(e)));
            }
        }

        await Promise.all(executions);
    }

    registerSubscribers(subscribers: DomainEventSubscriber<DomainEvent>[]): void {
        for (const subscriber of subscribers) {
            for (const e of subscriber.subscribedTo()) {
                this.subscribe(e.eventName, subscriber);
            }
        }
    }

    private subscribe(topic: string, subscriber: DomainEventSubscriber<DomainEvent>): void {
        const currentSubscriptions = this.subscriptions.get(topic),
            subscription = subscriber.on.bind(subscriber);

        if (currentSubscriptions) {
            currentSubscriptions.push(subscription);
        } else {
            this.subscriptions.set(topic, [subscription]);
        }
    }
}
