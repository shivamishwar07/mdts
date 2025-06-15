type Listener<T> = (data: T) => void;

class EventBus {
    private events: { [key: string]: Listener<any>[] } = {};

    on<T>(event: string, listener: Listener<T>): void {
        if (!this.events[event]) {
            this.events[event] = [];
        }
        this.events[event].push(listener);
    }

    emit<T>(event: string, data: T): void {
        if (this.events[event]) {
            this.events[event].forEach(listener => listener(data));
        }
    }

    remove(event: string): void {
        if (this.events[event]) {
            this.events[event] = [];
        }
    }
}

const eventBus = new EventBus();
export default eventBus;
