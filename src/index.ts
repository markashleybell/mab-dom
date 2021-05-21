export function dom(selector: string) {
    return new DOM(selector);
}

interface ElementWithValueAttribute {
    value: string;
}

class DOM {
    private el: HTMLElement[];

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
    }

    public onchild(childSelector: string, event: string, handler: (e: Event) => void): void {
        if (!this.el) {
            return;
        }

        const delegatedHandler = (e: Event) => {
            if ((e.target as HTMLElement).matches(childSelector)) {
                handler(e);
            }
        };

        this.el.forEach(el => el.addEventListener(event, delegatedHandler));
    }

    public on(event: string, handler: (e: Event) => void): void {
        if (!this.el) {
            return;
        }

        this.el.forEach(el => el.addEventListener(event, handler));
    }

    public data(key: string): string {
        return this.el.map(el => el.getAttribute('data-' + key)).join();
    }

    public get(index?: number): HTMLElement {
        return index ? this.el[index] : this.el[0];
    }

    public find(selector: string): DOM {
        return new DOM(selector, this.el);
    }

    public val(value?: number | string): string | void {
        if (!value) {
            return this.el.map(el => this.elementWithValue(el)?.value).join();
        }

        this.el.forEach(el => {
            const input = this.elementWithValue(el);

            if (input) {
                input.value = value.toString();
            }
        });
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

    private elementWithValue(el: HTMLElement): ElementWithValueAttribute {
        const isInputType = el instanceof HTMLInputElement
            || el instanceof HTMLSelectElement
            || el instanceof HTMLTextAreaElement;

        return isInputType
            ? el as unknown as ElementWithValueAttribute
            : null;
    }
}
