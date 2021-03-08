// GENERATED WITH generate-main-exports
// Warning: Do not edit by hand, all changes will be lost on next execution!

import { AsyncStorage } from './classes/AsyncStorage';
import { BlackholeStorage } from './classes/BlackholeStorage';
import { blackholeStorage } from './classes/BlackholeStorage';
import { BrowserHistoryPathHashStorage } from './classes/BrowserHistoryStorage/BrowserHistoryPathHashStorage';
import { BrowserHistoryPathStorage } from './classes/BrowserHistoryStorage/BrowserHistoryPathStorage';
import { BrowserHistoryQueryStorage } from './classes/BrowserHistoryStorage/BrowserHistoryQueryStorage';
import { IBrowserHistoryStorageOptions } from './classes/BrowserHistoryStorage/IBrowserHistoryStorageOptions';
import { BROWSER_HISTORY_STORAGE_OPTIONS_DEFAULTS } from './classes/BrowserHistoryStorage/IBrowserHistoryStorageOptions';
import { MemoryStorage } from './classes/MemoryStorage';
import { MultiStorage } from './classes/MultiStorage';
import { ObjectStorage } from './classes/ObjectStorage';
import { objectLocalStorage } from './classes/ObjectStorage';
import { PrefixStorage } from './classes/PrefixStorage';
import { SerializedStorage } from './classes/SerializedStorage';
import { IAwaitable } from './interfaces/IAwaitable';
import { IBrowserState } from './interfaces/IBrowserState';
import { IInstantiable } from './interfaces/IInstantiable';
import { IJson } from './interfaces/IJson';
import { IObservableStorage } from './interfaces/IObservableStorage';
import { ISerializable } from './interfaces/ISerializable';
import { ISerializableCore } from './interfaces/ISerializable';
import { ISerialized } from './interfaces/ISerialized';
import { ISerializeRule } from './interfaces/ISerializeRule';
import { IStorage } from './interfaces/IStorage';
import { createUniqueIdentifierFromParams } from './utils/createUniqueIdentifierFromParams';
import { IAwaitable } from './utils/IAwaitable';
import { IDestroyable } from './interfaces/IDestroyable';
import { isNumeric } from './utils/isNumeric';
import { Serializer } from './utils/Serializer';
import { serializer } from './utils/serializers';
import { serializerWithDate } from './utils/serializers';

export {
    IJson,
    IStorage,
    isNumeric,
    serializer,
    Serializer,
    IAwaitable,
    IAwaitable,
    ISerialized,
    IDestroyable,
    MultiStorage,
    AsyncStorage,
    ISerializable,
    IInstantiable,
    IBrowserState,
    PrefixStorage,
    ObjectStorage,
    MemoryStorage,
    ISerializeRule,
    blackholeStorage,
    BlackholeStorage,
    ISerializableCore,
    SerializedStorage,
    serializerWithDate,
    IObservableStorage,
    objectLocalStorage,
    BrowserHistoryPathStorage,
    BrowserHistoryQueryStorage,
    IBrowserHistoryStorageOptions,
    BrowserHistoryPathHashStorage,
    createUniqueIdentifierFromParams,
    BROWSER_HISTORY_STORAGE_OPTIONS_DEFAULTS,
};
