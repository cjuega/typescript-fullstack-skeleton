import { EventBus } from '@src/domain/eventBus/eventBus';
import DomainEvent from '@src/domain/eventBus/domainEvent';

export default class EventBusMock implements EventBus {
    private mockPublish = jest.fn<Promise<void>, DomainEvent[][], EventBusMock>();

    async publish(events: DomainEvent[]): Promise<void> {
        await this.mockPublish(events);
    }

    whenPublishThrowFor(events: DomainEvent[]): void {
        const failingEventIds = events.map((e) => e.eventId);

        this.mockPublish.mockImplementation((evts) => {
            if (evts.some((e) => failingEventIds.includes(e.eventId))) {
                throw new Error('Publish failed');
            }

            return Promise.resolve();
        });
    }

    assertLastPublishedEventIs(expectedEvent: DomainEvent): void {
        const publishSpyCalls = this.mockPublish.mock.calls,
            lastPublishSpyCall = publishSpyCalls[publishSpyCalls.length - 1],
            lastPublishedEvent = lastPublishSpyCall[0][0];

        expect(publishSpyCalls.length).toBeGreaterThan(0);

        expect(this.getDataFromDomainEvent(expectedEvent)).toMatchObject(this.getDataFromDomainEvent(lastPublishedEvent));
    }

    assertLastPublishedEventsAre(events: DomainEvent[]): void {
        const publishSpyCalls = this.mockPublish.mock.calls,
            lastPublishSpyCall = publishSpyCalls[publishSpyCalls.length - 1],
            lastPublishedEvents = lastPublishSpyCall[0];

        expect(publishSpyCalls.length).toBeGreaterThan(0);
        expect(lastPublishedEvents).toHaveLength(events.length);

        lastPublishedEvents.forEach((publishedEvent: DomainEvent, i: number) => {
            const expectedEvent = events[i];

            expect(this.getDataFromDomainEvent(expectedEvent)).toMatchObject(this.getDataFromDomainEvent(publishedEvent));
        });
    }

    assertPublishedEventsAre(events: DomainEvent[]): void {
        const { mock } = this.mockPublish,
            // eslint-disable-next-line @typescript-eslint/no-unsafe-return
            callsArgument = mock.calls.map((c) => this.getDataFromDomainEvent(c[0][0]));

        expect(mock.calls).toHaveLength(events.length);

        events.forEach((e) => {
            expect(callsArgument).toContainEqual(this.getDataFromDomainEvent(e));
        });
    }

    assertEmptyPublished(): void {
        const publishSpyCalls = this.mockPublish.mock.calls,
            lastPublishSpyCall = publishSpyCalls[publishSpyCalls.length - 1],
            lastPublishedEvents = lastPublishSpyCall[0];

        expect(lastPublishedEvents).toHaveLength(0);
    }

    assertNothingPublished(): void {
        const publishSpyCalls = this.mockPublish.mock.calls;

        expect(publishSpyCalls).toHaveLength(0);
    }

    customAssertion(nCalls: number, assertion: (callsArgs: DomainEvent[][]) => void): void {
        const publishSpyCalls = this.mockPublish.mock.calls;

        assertion(publishSpyCalls.slice(-nCalls).map((c) => c[0]));
    }

    assertPublishHasBeenCalledTimes(n: number): void {
        expect(this.mockPublish).toHaveBeenCalledTimes(n);
    }

    // eslint-disable-next-line class-methods-use-this
    private getDataFromDomainEvent(event: DomainEvent): any {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { eventId, occurredOn, ...attributes } = event;

        return attributes;
    }
}
