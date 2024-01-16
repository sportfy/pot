import { initReactI18next } from 'react-i18next';
import i18n from 'i18next';
import zh_CN from './locales/zh_CN.json';
import zh_TW from './locales/zh_TW.json';
import en_US from './locales/en_US.json';
import ru_RU from './locales/ru_RU.json';
import pt_BR from './locales/pt_BR.json';
import de_DE from './locales/de_DE.json';
import es_ES from './locales/es_ES.json';
import fr_FR from './locales/fr_FR.json';
import it_IT from './locales/it_IT.json';
import ja_JP from './locales/ja_JP.json';
import ko_KR from './locales/ko_KR.json';
import pt_PT from './locales/pt_PT.json';
import tr_TR from './locales/tr_TR.json';
import nb_NO from './locales/nb_NO.json';
import nn_NO from './locales/nn_NO.json';
import fa_IR from './locales/fa_IR.json';
import uk_UA from './locales/uk_UA.json';
import nl_NL from './locales/nl_NL.json';
import ms_MY from './locales/ms_MY.json';
import ar_SA from './locales/ar_SA.json';
import hi_IN from './locales/hi_IN.json';
import mn_MO from './locales/mn_MO.json';
import mn_CY from './locales/mn_CY.json';
import km_KH from './locales/km_KH.json';

// http://www.lingoes.net/zh/translator/langcode.htm

i18n.use(initReactI18next).init({
    fallbackLng: {
        zh_tw: ['zh_cn'],
        zh_cn: ['zh_tw'],
        pt_pt: ['pt_br'],
        pt_br: ['pt_pt'],
        nb_no: ['nn_no'],
        nn_no: ['nb_no'],
        nl_nl: ['en'],
        ms_my: ['en'],
        ar_sa: ['en'],
        hi_in: ['en'],
        mn_mo: ['en'],
        mn_cy: ['en'],
        km_kh: ['en'],
        default: ['en'],
    },
    debug: false,
    interpolation: {
        escapeValue: false,
    },
    resources: {
        en: en_US,
        zh_cn: zh_CN,
        zh_tw: zh_TW,
        ja: ja_JP,
        ko: ko_KR,
        fr: fr_FR,
        es: es_ES,
        ru: ru_RU,
        de: de_DE,
        it: it_IT,
        tr: tr_TR,
        pt_pt: pt_PT,
        pt_br: pt_BR,
        nb_no: nb_NO,
        nn_no: nn_NO,
        fa: fa_IR,
        uk: uk_UA,
        nl_nl: nl_NL,
        ms_my: ms_MY,
        ar_sa: ar_SA,
        hi_in: hi_IN,
        mn_mo: mn_MO,
        mn_cy: mn_CY,
        km_kh: km_KH,
    },
});

export default i18n;
