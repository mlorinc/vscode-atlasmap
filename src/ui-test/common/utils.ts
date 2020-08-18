import { atlasMapWindowExists, getNotificationWithMessage } from './conditions';
import { commands, notifications, views } from './constants';
import { EditorView, VSBrowser, Workbench } from 'vscode-extension-tester';

export async function startAtlasMap(timeout: number = 20000) {
	await new Workbench().executeCommand(commands.START_ATLASMAP);
	return VSBrowser.instance.driver.wait(() => atlasMapWindowExists(), timeout, 'Could not start atlas map');
}

export async function stopAtlasMap(timeout: number = 10000) {
	await new Workbench().executeCommand(commands.STOP_ATLASMAP);
	return VSBrowser.instance.driver.wait(() => getNotificationWithMessage(notifications.ATLASMAP_STOPPED), timeout, 'Could not stop atlas map');
}

export async function atlasMapTabIsAccessible() {
	return new EditorView().openEditor(views.ATLASMAP_TITLE);
}

export async function clearNotifications(): Promise<void> {
	try {
		const center = await new Workbench().openNotificationsCenter();
		await center.clearAllNotifications();
	} catch (err) {
		console.log(err);
	}
}
