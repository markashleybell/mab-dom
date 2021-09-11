export function dom(selectorOrElement: string | HTMLElement | NodeListOf<HTMLElement>) {
    return new DOM(selectorOrElement);
}

interface ElementWithValueAttribute {
    value: string;
}

const rootSelector = '~ROOT~';

export class DOMEvent extends Event {
    public handlerAttachedToElement: HTMLElement;
    public handlerTriggeredByElement: HTMLElement;
    public handlerChildSelector: string;
    public handlerElement: HTMLElement;
}

export class DOM {
    private el: HTMLElement[];
    public eventHandlers: Map<string, Map<string, Set<any>>>; // Map<EventName, Map<Selector, Set<Handler>>>

    constructor(public selectorOrElement: string | HTMLElement | NodeListOf<HTMLElement>, parent?: HTMLElement[]) {
        if (typeof selectorOrElement === 'string') {
            if (parent) {
                const elements = parent
                    .map(el => [].slice.call(el.querySelectorAll(selectorOrElement)))
                    .filter(x => x.length);

                this.el = [].concat(...elements);
            } else {
                this.el = [].slice.call(document.querySelectorAll(selectorOrElement as string));
            }
        } else if (selectorOrElement instanceof Element) {
            this.el = [selectorOrElement as HTMLElement];
        } else {
            this.el = [].slice.call(selectorOrElement as NodeListOf<HTMLElement>);
        }

        this.eventHandlers = new Map<string, Map<string, Set<any>>>();
    }

    public onchild(childSelector: string, event: string, handler: (e: DOMEvent) => void): void {
        if (!this.el) {
            return;
        }

        const createDelegatedHandler = (attachedToElement: HTMLElement) => (e: DOMEvent) => {
            e.handlerAttachedToElement = attachedToElement;
            e.handlerTriggeredByElement = e.target as HTMLElement;
            e.handlerElement = e.handlerTriggeredByElement.closest(childSelector);
            e.handlerChildSelector = childSelector;

            if (e.handlerElement) {
                handler(e);
            }
        };

        this.el.forEach(el => {
            const delegatedHandler = createDelegatedHandler(el);
            this.addHandlerReference(event, delegatedHandler, childSelector);
            el.addEventListener(event, delegatedHandler);
        });
    }

    public on(event: string, handler: (e: DOMEvent) => void): void {
        if (!this.el) {
            return;
        }

        const createNonDelegatedHandler = (attachedToElement: HTMLElement) => (e: DOMEvent) => {
            e.handlerAttachedToElement = attachedToElement;
            e.handlerTriggeredByElement = e.target as HTMLElement;
            e.handlerElement = attachedToElement;

            handler(e);
        };

        this.el.forEach(el => {
            const nonDelegatedHandler = createNonDelegatedHandler(el);
            this.addHandlerReference(event, nonDelegatedHandler);
            el.addEventListener(event, nonDelegatedHandler);
        });
    }

    public off(event: string): void {
        if (!this.el) {
            return;
        }

        const handlersForEvent = this.eventHandlers.get(event);

        if (handlersForEvent) {
            this.el.forEach(el => {
                for (const [selector, handlers] of handlersForEvent) {
                    // If the selector is empty, this is a 'top level' event
                    if (selector == rootSelector) {
                        handlers.forEach(handler => el.removeEventListener(event, handler));
                        handlersForEvent.delete(selector);
                        if (handlersForEvent.size === 0) {
                            this.eventHandlers.delete(event);
                        }
                    }
                }
            });
        }
    }

    public offchild(childSelector: string, event: string): void {
        if (!this.el) {
            return;
        }

        const handlersForEvent = this.eventHandlers.get(event);

        if (handlersForEvent) {
            this.el.forEach(el => {
                for (const [selector, handlers] of handlersForEvent) {
                    if (selector === childSelector) {
                        handlers.forEach(handler => el.removeEventListener(event, handler));
                        handlersForEvent.delete(selector);
                        if (handlersForEvent.size === 0) {
                            this.eventHandlers.delete(event);
                        }
                    }
                }
            });
        }
    }

    public data(key: string): string {
        return this.el.map(el => el.getAttribute('data-' + key)).join();
    }

    public get(index?: number): HTMLElement {
        return index ? this.el[index] : this.el[0];
    }

    public as<T extends HTMLElement>(index?: number): T {
        return this.get(index) as T;
    }

    public find(selector: string): DOM {
        return new DOM(selector, this.el);
    }

    public val(value?: number | string): string {
        if (typeof value === 'undefined') {
            return this.el.map(el => this.elementWithValue(el)?.value).join();
        }

        const v = (value === null ? '' : value).toString();

        this.el.forEach(el => {
            const input = this.elementWithValue(el);

            if (input) {
                input.value = v;
            }
        });

        return v;
    }

    public focus(index?: number): void {
        const input = (index ? this.el[index] : this.el[0]);

        input.focus();
    }

    public html(html?: string): string {
        const input = this.el[0];

        if (html) {
            input.innerHTML = html;
        }

        return input.innerHTML;
    }

    public text(text?: string): string {
        const input = this.el[0];

        if (text) {
            input.innerText = text;
        }

        return input.innerText;
    }

    public addClass(className: string): DOM {
        this.el.forEach(el => el.classList.add(className));
        return this;
    }

    public removeClass(className: string): DOM {
        this.el.forEach(el => el.classList.remove(className));
        return this;
    }

    public each(fn: (el: DOM) => void): void {
        this.el.forEach(el => fn(new DOM(el)));
    }

    public parent(): DOM {
        return new DOM(this.el[0].parentElement);
    }

    public exists(): boolean {
        return this.el.length > 0;
    }

    private elementWithValue(el: HTMLElement): ElementWithValueAttribute {
        const isInputType = el instanceof HTMLInputElement
            || el instanceof HTMLSelectElement
            || el instanceof HTMLTextAreaElement;

        return isInputType
            ? el as unknown as ElementWithValueAttribute
            : null;
    }

    private addHandlerReference(event: string, handler: any, selector?: string): void {
        if (!this.eventHandlers.has(event)) {
            this.eventHandlers.set(event, new Map<string, Set<any>>());
        }

        const handlerMap = this.eventHandlers.get(event);

        const s = selector || rootSelector;

        if (!handlerMap.has(s)) {
            handlerMap.set(s, new Set<any>());
        }

        handlerMap.get(s).add(handler);
    }
}
