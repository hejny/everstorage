import { IObservableStorage } from '../../interfaces/IObservableStorage';
import { ISerializable } from '../../interfaces/ISerializable';
import { AbstractBrowserHistoryStorage } from './AbstractBrowserHistoryStorage';
import { IBrowserHistoryPathStorageArgs } from './BrowserHistoryPathStorage';

// TODO: Maybe some more elegant way how to do this
let instanced = false;
export class BrowserHistoryPathHashStorage<TValue extends ISerializable>
    extends AbstractBrowserHistoryStorage<TValue>
    implements IObservableStorage<TValue> {
    constructor(private args: IBrowserHistoryPathStorageArgs<TValue>) {
        super(args);

        if (instanced) {
            /* tslint:disable: no-console*/
            console.warn(
                `BrowserHistoryPathHashStorage has more than one instance. This can cause malfunctioning of the app.`,
            );
        } else {
            instanced = true;
        }
    }

    protected decodeUrl(url: URL): Partial<TValue> {
        const parsing = /#?\/+(?<route>.*)/.exec(url.hash);
        if (!parsing || !parsing.groups) {
            return this.args.decodeUrlPath('/');
            // throw new Error(`Error while parsing url.`);
        }
        const { route } = parsing.groups;
        return this.args.decodeUrlPath('/' + route);
    }

    protected encodeUrl(params: TValue, lastUrl: URL): URL {
        // Note: deep clonning to prevent mutating
        const urlObject = new URL(lastUrl.toString());
        urlObject.hash = '#' + this.args.encodeUrlPath(params);
        return urlObject;
    }
}
