import { atlasMapWindowExists, getNotificationWithMessage } from './conditions';
import { commands, notifications, views } from './constants';
import { EditorView, VSBrowser, Workbench, until, Notification, NotificationsCenter, WebElement, WebDriver, Key } from 'vscode-extension-tester';

export async function startAtlasMap(timeout: number = 20000) {
	const progressNotificationPromise: Promise<Notification | Error> = VSBrowser.instance.driver.wait(
		() => getNotificationWithMessage(notifications.ATLASMAP_WAITING), timeout
	).catch((e) => new Error(`Could not find '${notifications.ATLASMAP_WAITING}' notification. Reason: ${e}`)) as Promise<Notification | Error>;

	await new Workbench().executeCommand(commands.START_ATLASMAP);
	await VSBrowser.instance.driver.wait(() => atlasMapWindowExists(), timeout, 'Could not start atlas map');

	if (await progressNotificationPromise instanceof Error) {
		throw await progressNotificationPromise;
	}

	await VSBrowser.instance.driver.wait(until.stalenessOf(await progressNotificationPromise as Notification), timeout);
}

export async function stopAtlasMap(timeout: number = 10000) {
	await new Workbench().executeCommand(commands.STOP_ATLASMAP);
	return VSBrowser.instance.driver.wait(() => getNotificationWithMessage(notifications.ATLASMAP_STOPPED), timeout, 'Could not stop atlas map');
}

export async function atlasMapTabIsAccessible() {
	return new EditorView().openEditor(views.ATLASMAP_TITLE);
}

function patch() {

	const wait = async (driver: WebDriver, element: WebElement) => {
		const enabled = () => driver.wait(until.elementIsEnabled(element)).catch(() => false).then(() => true);
		const classEnabled = () => driver.wait(async () => !(await element.getAttribute('class')).includes('disabled'))
		return await enabled() && await classEnabled();
	};

	NotificationsCenter.prototype.clearAllNotifications = async function () {
		// @ts-ignore
		const element: WebElement = await this.findElement(NotificationsCenter.locators.NotificationsCenter.clear);
		await element.sendKeys(Key.ENTER);
	};
}

export async function clearNotifications(): Promise<void> {
	try {
		patch();
		console.log('Get notification center');
		const center = await new Workbench().openNotificationsCenter();
		console.log('Clear notification');
		await center.clearAllNotifications();
		console.log('Cleared notifications');
	} catch (err) {
		console.log(err);
	}
}
