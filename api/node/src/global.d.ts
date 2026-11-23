import 'http';
import { IBaseRequestHeader } from './presentation/interfaces/request.interface';

declare module 'http' {
	interface IncomingHttpHeaders extends IBaseRequestHeader {}
}
