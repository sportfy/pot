import { Button, Card, CardBody, CardFooter, ButtonGroup, Chip } from '@nextui-org/react';
import { BaseDirectory, readTextFile } from '@tauri-apps/api/fs';
import { readText, writeText } from '@tauri-apps/api/clipboard';
import React, { useEffect, useRef, useState } from 'react';
import { HiOutlineVolumeUp } from 'react-icons/hi';
import { appWindow } from '@tauri-apps/api/window';

import { listen } from '@tauri-apps/api/event';
import { MdContentCopy } from 'react-icons/md';
import { MdSmartButton } from 'react-icons/md';
import { useTranslation } from 'react-i18next';
import { HiTranslate } from 'react-icons/hi';
import { invoke } from '@tauri-apps/api';
import { atom, useAtom } from 'jotai';

import { local_detect, google_detect, baidu_detect } from '../../../../services/translate/utils/lang_detect';
import * as recognizeServices from '../../../../services/recognize';
import * as buildinTtsServices from '../../../../services/tts';
import { useConfig, useSyncAtom } from '../../../../hooks';
import { store } from '../../../../utils/store';

export const sourceTextAtom = atom('');
export const detectLanguageAtom = atom('');

let unlisten = null;
let timer = null;

export default function SourceArea(props) {
    const { pluginList } = props;
    const [sourceText, setSourceText] = useSyncAtom(sourceTextAtom);
    const [detectLanguage, setDetectLanguage] = useAtom(detectLanguageAtom);
    const [incrementalTranslate] = useConfig('incremental_translate', false);
    const [dynamicTranslate] = useConfig('dynamic_translate', false);
    const [deleteNewline] = useConfig('translate_delete_newline', false);
    const [recognizeLanguage] = useConfig('recognize_language', 'auto');
    const [recognizeServiceList] = useConfig('recognize_service_list', ['system', 'tesseract', 'paddle']);
    const [ttsServiceList] = useConfig('tts_service_list', ['lingva_tts']);
    const [langDetectEngine] = useConfig('translate_detect_engine', 'baidu');
    const [hideWindow] = useConfig('translate_hide_window', false);
    const [ttsPluginInfo, setTtsPluginInfo] = useState();
    const { t } = useTranslation();
    const textAreaRef = useRef();

    const handleNewText = async (text) => {
        if (hideWindow) {
            appWindow.hide();
        } else {
            appWindow.show();
            appWindow.setFocus();
        }
        setDetectLanguage('');
        if (text === '') {
            text = (await readText()) ?? '';
        }
        if (text === '[INPUT_TRANSLATE]') {
            appWindow.show();
            appWindow.setFocus();
            setSourceText('', true);
        } else if (text === '[IMAGE_TRANSLATE]') {
            setSourceText(t('translate.recognizing'));
            const base64 = await invoke('get_base64');
            const serviceName = recognizeServiceList[0];
            if (serviceName.startsWith('[plugin]')) {
                if (recognizeLanguage in pluginList['recognize'][serviceName].language) {
                    const pluginConfig = (await store.get(serviceName)) ?? {};
                    invoke('invoke_plugin', {
                        name: serviceName,
                        base64,
                        lang: pluginList['recognize'][serviceName].language[recognizeLanguage],
                        pluginType: 'recognize',
                        needs: pluginConfig,
                    }).then(
                        (v) => {
                            let newText = v;
                            if (deleteNewline) {
                                newText = v.replace(/\s+/g, ' ');
                            } else {
                                newText = v;
                            }
                            setSourceText(newText);
                            detect_language(newText).then(() => {
                                if (incrementalTranslate) {
                                    setSourceText((old) => {
                                        return old + ' ' + newText;
                                    }, true);
                                } else {
                                    setSourceText(newText, true);
                                }
                            });
                        },
                        (e) => {
                            setSourceText(e.toString());
                        }
                    );
                } else {
                    setSourceText('Language not supported');
                }
            } else {
                if (recognizeLanguage in recognizeServices[serviceName].Language) {
                    recognizeServices[serviceName]
                        .recognize(base64, recognizeServices[serviceName].Language[recognizeLanguage])
                        .then(
                            (v) => {
                                let newText = v;
                                if (deleteNewline) {
                                    newText = v.replace(/\s+/g, ' ');
                                } else {
                                    newText = v;
                                }
                                setSourceText(newText);
                                detect_language(newText).then(() => {
                                    if (incrementalTranslate) {
                                        setSourceText((old) => {
                                            return old + ' ' + newText;
                                        }, true);
                                    } else {
                                        setSourceText(newText, true);
                                    }
                                });
                            },
                            (e) => {
                                setSourceText(e.toString());
                            }
                        );
                } else {
                    setSourceText('Language not supported');
                }
            }
        } else {
            let newText = text;
            if (deleteNewline) {
                newText = text.replace(/\s+/g, ' ');
            } else {
                newText = text;
            }
            setSourceText(newText);
            detect_language(newText).then(() => {
                if (incrementalTranslate) {
                    setSourceText((old) => {
                        return old + ' ' + newText;
                    }, true);
                } else {
                    setSourceText(newText, true);
                }
            });
        }
    };

    const keyDown = (event) => {
        if (event.key === 'Enter' && !event.shiftKey) {
            event.preventDefault();
            detect_language(sourceText).then(() => {
                setSourceText(event.target.value, true);
            });
        }
        if (event.key === 'Escape') {
            appWindow.close();
        }
    };

    useEffect(() => {
        if (hideWindow !== null) {
            if (unlisten) {
                unlisten.then((f) => {
                    f();
                });
            }
            unlisten = listen('new_text', (event) => {
                appWindow.setFocus();
                handleNewText(event.payload);
            });
        }
    }, [hideWindow]);

    useEffect(() => {
        if (ttsServiceList && ttsServiceList[0].startsWith('[plugin]')) {
            readTextFile(`plugins/tts/${ttsServiceList[0]}/info.json`, {
                dir: BaseDirectory.AppConfig,
            }).then((infoStr) => {
                setTtsPluginInfo(JSON.parse(infoStr));
            });
        }
    }, [ttsServiceList]);

    useEffect(() => {
        if (
            deleteNewline !== null &&
            incrementalTranslate !== null &&
            recognizeLanguage !== null &&
            recognizeServiceList !== null &&
            hideWindow !== null
        ) {
            invoke('get_text').then((v) => {
                handleNewText(v);
            });
        }
    }, [deleteNewline, incrementalTranslate, recognizeLanguage, recognizeServiceList, hideWindow]);

    useEffect(() => {
        textAreaRef.current.style.height = '50px';
        textAreaRef.current.style.height = textAreaRef.current.scrollHeight + 'px';
    }, [sourceText]);

    const detect_language = async (text) => {
        switch (langDetectEngine) {
            case 'baidu':
                setDetectLanguage(await baidu_detect(text));
                break;
            case 'google':
                setDetectLanguage(await google_detect(text));
                break;
            case 'local':
                setDetectLanguage(await local_detect(text));
                break;
            default:
                setDetectLanguage(await local_detect(text));
        }
    };

    return (
        <Card
            shadow='none'
            className='bg-content1 rounded-[10px] mt-[1px] pb-0'
        >
            <CardBody className='bg-content1 p-[12px] pb-0 max-h-[40vh] overflow-y-auto'>
                <textarea
                    autoFocus
                    ref={textAreaRef}
                    className='bg-content1 h-full resize-none outline-none'
                    value={sourceText}
                    onKeyDown={keyDown}
                    onChange={(e) => {
                        const v = e.target.value;
                        setDetectLanguage('');
                        setSourceText(v);
                        if (dynamicTranslate) {
                            if (timer) {
                                clearTimeout(timer);
                            }
                            timer = setTimeout(() => {
                                detect_language(v).then(() => {
                                    setSourceText(v, true);
                                });
                            }, 1000);
                        }
                    }}
                />
            </CardBody>

            <CardFooter className='bg-content1 rounded-none rounded-b-[10px] flex justify-between px-[12px] p-[5px]'>
                <div className='flex justify-start'>
                    <ButtonGroup className='mr-[5px]'>
                        <Button
                            isIconOnly
                            variant='light'
                            size='sm'
                            onPress={async () => {
                                const serviceName = ttsServiceList[0];
                                if (serviceName.startsWith('[plugin]')) {
                                    const config = (await store.get(serviceName)) ?? {};
                                    invoke('invoke_plugin', {
                                        name: serviceName,
                                        pluginType: 'tts',
                                        text: sourceText,
                                        lang: ttsPluginInfo.language[detectLanguage],
                                        needs: config,
                                    });
                                } else {
                                    await buildinTtsServices[serviceName].tts(
                                        sourceText,
                                        buildinTtsServices[serviceName].Language[detectLanguage]
                                    );
                                }
                            }}
                        >
                            <HiOutlineVolumeUp className='text-[16px]' />
                        </Button>
                        <Button
                            isIconOnly
                            variant='light'
                            size='sm'
                            onPress={() => {
                                writeText(sourceText);
                            }}
                        >
                            <MdContentCopy className='text-[16px]' />
                        </Button>
                        <Button
                            isIconOnly
                            variant='light'
                            size='sm'
                            onPress={() => {
                                const newText = sourceText.replace(/\s+/g, ' ');
                                detect_language(newText).then(() => {
                                    setSourceText(newText, true);
                                });
                            }}
                        >
                            <MdSmartButton className='text-[16px]' />
                        </Button>
                    </ButtonGroup>
                    {detectLanguage !== '' && (
                        <Chip
                            size='sm'
                            color='secondary'
                            variant='dot'
                            className='my-auto'
                        >
                            {t(`languages.${detectLanguage}`)}
                        </Chip>
                    )}
                </div>
                <Button
                    size='sm'
                    color='primary'
                    variant='solid'
                    className='text-[14px] font-bold'
                    startContent={<HiTranslate className='text-[16px]' />}
                    onPress={() => {
                        detect_language(sourceText).then(() => {
                            setSourceText(sourceText, true);
                        });
                    }}
                >
                    {t('translate.translate')}
                </Button>
            </CardFooter>
        </Card>
    );
}