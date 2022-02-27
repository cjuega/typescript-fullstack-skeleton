/* eslint-disable @typescript-eslint/ban-types */
import { DomainEvent } from '@src/domain/eventBus/domainEvent';
import { DomainEventSubscriber } from '@src/domain/eventBus/domainEventSubscriber';
import { EventBus } from '@src/domain/eventBus/eventBus';
import { EventBusMiddleware } from '@src/domain/eventBus/eventBusMiddleware';

type Subscription = {
    boundedCallback: Function;
    originalCallback: Function;
};

export default class InMemorySyncEventBus implements EventBus {
    private subscriptions: Map<string, Array<Subscription>>;

    private middlewares: EventBusMiddleware[];

    constructor(...middlewares: EventBusMiddleware[]) {
        this.subscriptions = new Map();
        this.middlewares = middlewares;
    }

    async publish(domainEvents: Array<DomainEvent>): Promise<void> {
        const events = await this.applyMiddlewares(domainEvents),
            executions: any = [];

        events.forEach((event) => {
            const subscribers = this.subscriptions.get(event.eventName);

            if (subscribers) {
                subscribers.map((subscriber) => executions.push(subscriber.boundedCallback(event)));
            }
        });

        await Promise.all(executions);
    }

    private async applyMiddlewares(domainEvents: Array<DomainEvent>): Promise<Array<DomainEvent>> {
        let events = domainEvents;

        for (const middleware of this.middlewares) {
            // eslint-disable-next-line no-await-in-loop
            events = await middleware.run(events);
        }

        return events;
    }

    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
    addSubscribers(subscribers: Array<DomainEventSubscriber<DomainEvent>>) {
        subscribers.map((subscriber) => subscriber
            .subscribedTo()
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            .map((event) => this.subscribe(event.EVENT_NAME!, subscriber)));
    }

    private subscribe(topic: string, subscriber: DomainEventSubscriber<DomainEvent>): void {
        const currentSubscriptions = this.subscriptions.get(topic),
            subscription = {
                boundedCallback: subscriber.on.bind(subscriber),
                originalCallback: subscriber.on
            };

        if (currentSubscriptions) {
            currentSubscriptions.push(subscription);
        } else {
            this.subscriptions.set(topic, [subscription]);
        }
    }
}
