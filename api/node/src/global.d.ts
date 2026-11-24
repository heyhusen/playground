import 'http';
import { IBaseRequestHeader } from './presentation/interfaces/request.interface.js';

declare module 'http' {
	interface IncomingHttpHeaders extends IBaseRequestHeader {}
}
