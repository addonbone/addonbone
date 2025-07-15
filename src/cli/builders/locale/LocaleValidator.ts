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
        return (
            {
                [Browser.Chrome]: 75,
                [Browser.Firefox]: 50,
            }[this.browser] || 45
        );
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
    ) {}

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

        const name = this.nameKey && data.get(this.nameKey);
        const shortName = this.shortNameKey && data.get(this.shortNameKey);
        const description = this.descriptionKey && data.get(this.descriptionKey);

        if (name && name.length > this.nameLimit) {
            throw new LocaleError(
                this.browser,
                this.language,
                `Name "${name}" [${this.nameKey}] exceeds ${this.nameLimit} characters`
            );
        }

        if (shortName && shortName.length > this.shortNameLimit) {
            throw new LocaleError(
                this.browser,
                this.language,
                `Short name "${shortName}" [${this.shortNameKey}] exceeds ${this.shortNameLimit} characters`
            );
        }

        if (description && description.length > this.descriptionLimit) {
            throw new LocaleError(
                this.browser,
                this.language,
                `Description "${description}" [${this.descriptionKey}] exceeds ${this.descriptionLimit} characters`
            );
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
