import { AsyncStorage } from './classes/AsyncStorage';
import { BlackholeStorage } from './classes/BlackholeStorage';
import { BrowserHistoryQueryStorage } from './classes/BrowserHistoryQueryStorage';
import { BrowserHistoryRouteStorage } from './classes/BrowserHistoryPathStorage';
import { MemoryStorage } from './classes/MemoryStorage';
import { MultiStorage } from './classes/MultiStorage';
import { ObjectStorage } from './classes/ObjectStorage';
import { PrefixStorage } from './classes/PrefixStorage';
import { RemoteStorage } from './classes/RemoteStorage';
import { IStorage } from './interfaces/IStorage';
import { Instantiable } from './interfaces/utils/Instantiable';
import { IObjectStorage } from './interfaces/IObjectStorage';
import { IObservablesStorage } from './interfaces/IObservableStorage';
import { ISemanticStorage } from './interfaces/ISemanticStorage';
import { ISerialized } from './interfaces/utils/ISerialized';
import { ISerializeRule } from './interfaces/utils/ISerializeRule';
import { IStorage } from './interfaces/IStorage';

export {
    AsyncStorage,
    BlackholeStorage,
    BrowserHistoryQueryStorage as BrowserHistoryQueryParamsStorage,
    BrowserHistoryRouteStorage,
    MemoryStorage,
    MultiStorage,
    ObjectStorage,
    PrefixStorage,
    RemoteStorage,
    IStorage as IAsyncStorage,
    Instantiable as IInstantiable,
    IObjectStorage,
    IObservablesStorage,
    ISemanticStorage,
    ISerialized,
    ISerializeRule,
    IStorage,
};

// TODO: Auto generate

/**
 * TODOs:
 * Create util for storage from REST API
 */
