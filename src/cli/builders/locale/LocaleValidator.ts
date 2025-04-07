import {Language, LocaleBuilder, LocaleValidator} from "@typing/locale";
import {Browser} from "@typing/browser";

export class LocaleError extends Error {
    constructor(browser: Browser, language: Language, message: string) {
        super(`Locale for ${browser}:${language} - ${message}`);
    }
}

export default class implements LocaleValidator {
    protected nameKey?: string;
    protected descriptionKey?: string;
    protected shortNameKey?: string;

    protected get nameLimit(): number {
        return {
            [Browser.Chrome]: 75,
            [Browser.Firefox]: 50
        }[this.browser] || 45;
    }

    protected get descriptionLimit(): number {
        return 132;
    }

    protected get shortNameLimit(): number {
        return 12;
    }

    constructor(
        protected readonly browser: Browser,
        protected readonly language: Language
    ) {
    }

    public isValid(locale: LocaleBuilder): boolean {
        try {
            this.validate(locale);

            return true;
        } catch {
            return false;
        }
    }

    public validate(locale: LocaleBuilder): this {
        const data = locale.get();

        if (this.nameKey && data.get(this.nameKey)?.length > this.nameLimit) {
            throw new LocaleError(this.browser, this.language, `Name "${data.get(this.nameKey)}" [${this.nameKey}] exceeds ${this.nameLimit} characters`);
        }

        if (this.descriptionKey && data.get(this.descriptionKey)?.length > this.descriptionLimit) {
            throw new LocaleError(this.browser, this.language, `Description "${data.get(this.descriptionKey)}" [${this.descriptionKey}] exceeds ${this.descriptionLimit} characters`);
        }

        if (this.shortNameKey && data.get(this.shortNameKey)?.length > this.shortNameLimit) {
            throw new LocaleError(this.browser, this.language, `Short name ${data.get(this.shortNameKey)} [${this.shortNameKey}] exceeds ${this.shortNameLimit} characters`);
        }

        return this;
    }

    public setNameKey(nameKey?: string): this {
        this.nameKey = nameKey;

        return this;
    }

    public setDescriptionKey(descriptionKey?: string): this {
        this.descriptionKey = descriptionKey;

        return this;
    }

    public setShortNameKey(shortNameKey?: string): this {
        this.shortNameKey = shortNameKey;

        return this;
    }
}