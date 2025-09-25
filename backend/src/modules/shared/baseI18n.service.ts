import { I18nService, TranslateOptions } from 'nestjs-i18n';
import { RequestI18nContextService } from '@/common/context/i18nContext.service';
import { I18N_CONFIG } from '@/common/constants/i18n.constant';

export class BaseI18nService {
  constructor(
    protected readonly i18n: I18nService,
    protected readonly context: RequestI18nContextService,
  ) {}

  protected get lang(): string {
    return this.context.getLang() || I18N_CONFIG.fallbackLanguage;
  }

  protected async t(key: string, options?: TranslateOptions): Promise<string> {
    return this.i18n.translate(key, {
      lang: this.lang,
      ...options,
    }) as Promise<string>;
  }
}
