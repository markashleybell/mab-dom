export function dom(selectorOrElement: string | HTMLElement | NodeListOf<HTMLElement>) {
    return new DOM(selectorOrElement);
}

interface ElementWithValueAttribute {
    value: string;
}

export class DOM {
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
            if ((e.target as HTMLElement).closest(childSelector)) {
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

    public off(event: string, handler: (e: Event) => void): void {
        this.el.forEach(el => el.removeEventListener(event, handler));
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

    private elementWithValue(el: HTMLElement): ElementWithValueAttribute {
        const isInputType = el instanceof HTMLInputElement
            || el instanceof HTMLSelectElement
            || el instanceof HTMLTextAreaElement;

        return isInputType
            ? el as unknown as ElementWithValueAttribute
            : null;
    }
}
