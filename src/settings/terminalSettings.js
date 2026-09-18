import fsOperation from "fileSystem";
import settingsPage from "components/settingsPage";
import {
	DEFAULT_TERMINAL_SETTINGS,
	TerminalThemeManager,
} from "components/terminal";
import toast from "components/toast";
import alert from "dialogs/alert";
import confirm from "dialogs/confirm";
import loader from "dialogs/loader";
import fonts from "lib/fonts";
import appSettings from "lib/settings";
import FileBrowser from "pages/fileBrowser";
import helpers from "utils/helpers";

export default function terminalSettings() {
	const title = strings["terminal settings"];
	const values = appSettings.value;
	const categories = {
		permissions: strings["settings-category-permissions"],
		display: strings["settings-category-display"],
		cursor: strings["settings-category-cursor"],
		session: strings["settings-category-session"],
		maintenance: strings["settings-category-maintenance"],
	};

	// Initialize terminal settings with defaults if not present
	if (!values.terminalSettings) {
		values.terminalSettings = {
			...DEFAULT_TERMINAL_SETTINGS,
			fontFamily:
				DEFAULT_TERMINAL_SETTINGS.fontFamily || appSettings.value.fontFamily,
		};
	}

	const terminalValues = values.terminalSettings;

	Executor.setProotDebug(terminalValues.prootDebug);
	Executor.BackgroundExecutor.setProotDebug(terminalValues.prootDebug);

	const items = [
		{
			key: "all_file_access",
			text: strings["allFileAccess"],
			info: strings["info-all_file_access"],
			category: categories.permissions,
			chevron: true,
		},
		{
			key: "fontSize",
			text: strings["font size"],
			value: terminalValues.fontSize,
			prompt: strings["font size"],
			promptType: "number",
			promptOptions: {
				test(value) {
					value = Number.parseInt(value);
					return value >= 8 && value <= 32;
				},
			},
			info: strings["info-fontSize"],
			category: categories.display,
		},
		{
			key: "fontFamily",
			text: strings["terminal:font family"],
			value: terminalValues.fontFamily,
			get select() {
				return fonts.getNames();
			},
			info: strings["info-fontFamily"],
			category: categories.display,
		},
		{
			key: "fontWeight",
			text: strings["terminal:font weight"],
			value: terminalValues.fontWeight,
			valueText: (value) => {
				const tuple = [
					["normal", strings["terminal:normal"]],
					["bold", strings["terminal:bold"]],
				].find((item) => item[0] === value);

				return tuple ? tuple[1] : value;
			},
			select: [
				["normal", strings["terminal:normal"]],
				["bold", strings["terminal:bold"]],
				"100",
				"200",
				"300",
				"400",
				"500",
				"600",
				"700",
				"800",
				"900",
			],
			info: strings["info-fontWeight"],
			category: categories.display,
		},

		{
			key: "letterSpacing",
			text: strings["letter spacing"],
			value: terminalValues.letterSpacing,
			prompt: strings["letter spacing"],
			promptType: "number",
			info: strings["info-letterSpacing"],
			category: categories.display,
		},
		{
			key: "fontLigatures",
			text: strings["font ligatures"],
			checkbox: terminalValues.fontLigatures,
			info: strings["info-fontLigatures"],
			category: categories.display,
		},
		{
			key: "showScrollbar",
			text: strings["terminal:show scrollbar"] || "Show Scrollbar",
			checkbox: terminalValues.showScrollbar !== false,
			info:
				strings["info-terminal-show-scrollbar"] ||
				"Show the xterm scrollbar beside the terminal.",
			category: categories.display,
		},
		{
			key: "cursorStyle",
			text: strings["terminal:cursor style"],
			value: terminalValues.cursorStyle,
			valueText: (value) => {
				const option = [
					["block", strings["terminal:block"]],
					["underline", strings["terminal:underline"]],
					["bar", strings["terminal:bar"]],
				].find((item) => item[0] === value);
				return option ? option[1] : value;
			},
			select: [
				["block", strings["terminal:block"]],
				["underline", strings["terminal:underline"]],
				["bar", strings["terminal:bar"]],
			],
			info: strings["info-cursorStyle"],
			category: categories.cursor,
		},
		{
			key: "cursorInactiveStyle",
			text: strings["terminal:cursor inactive style"],
			value: terminalValues.cursorInactiveStyle,
			valueText: (value) => {
				const options = [
					["outline", strings["terminal:inactive outline"]],
					["block", strings["terminal:inactive block"]],
					["underline", strings["terminal:inactive underline"]],
					["bar", strings["terminal:inactive bar"]],
					["none", strings["terminal:inactive none"]],
				];
				const option = options.find((item) => item[0] === value);
				return option ? option[1] : value;
			},
			select: [
				["outline", strings["terminal:inactive outline"]],
				["block", strings["terminal:inactive block"]],
				["underline", strings["terminal:inactive underline"]],
				["bar", strings["terminal:inactive bar"]],
				["none", strings["terminal:inactive none"]],
			],
			info: strings["info-cursorInactiveStyle"],
			category: categories.cursor,
		},
		{
			key: "cursorBlink",
			text: strings["terminal:cursor blink"],
			checkbox: terminalValues.cursorBlink,
			info: strings["info-cursorBlink"],
			category: categories.cursor,
		},
		{
			key: "scrollback",
			text: strings["terminal:scrollback"],
			value: terminalValues.scrollback,
			prompt: strings["terminal:scrollback"],
			promptType: "number",
			promptOptions: {
				test(value) {
					value = Number.parseInt(value);
					return value >= 100 && value <= 10000;
				},
			},
			info: strings["info-scrollback"],
			category: categories.session,
		},
		{
			key: "tabStopWidth",
			text: strings["terminal:tab stop width"],
			value: terminalValues.tabStopWidth,
			prompt: strings["terminal:tab stop width"],
			promptType: "number",
			promptOptions: {
				test(value) {
					value = Number.parseInt(value);
					return value >= 1 && value <= 8;
				},
			},
			info: strings["info-tabStopWidth"],
			category: categories.session,
		},
		{
			key: "convertEol",
			text: strings["terminal:convert eol"],
			checkbox: terminalValues.convertEol,
			info: strings["settings-info-terminal-convert-eol"],
			category: categories.session,
		},
		{
			key: "imageSupport",
			text: strings["terminal:image support"],
			checkbox: terminalValues.imageSupport,
			info: strings["info-imageSupport"],
			category: categories.session,
		},
		{
			key: "confirmTabClose",
			text: strings["terminal:confirm tab close"],
			checkbox: terminalValues.confirmTabClose !== false,
			info: strings["info-confirmTabClose"],
			category: categories.session,
		},
		{
			key: "failsafeMode",
			text: strings["terminal:failsafe"],
			checkbox: terminalValues.failsafeMode,
			info: strings["terminal:failsafe-info"],
			category: categories.maintenance,
		},
		{
			key: "prootDebug",
			text: "PRoot Debug",
			checkbox: terminalValues.prootDebug,
			info: "Enable verbose PRoot logging (PROOT_VERBOSE=2). Useful for debugging sandbox issues.",
			category: categories.maintenance,
		},
		{
			key: "distro",
			text: strings["terminal:distro"] || "Linux Distribution",
			value: terminalValues.distro || "alpine",
			valueText: (value) => {
				const options = [
					["alpine", strings["terminal:distro-alpine"] || "Alpine Linux (Default)"],
					["ubuntu", strings["terminal:distro-ubuntu"] || "Ubuntu (Optional)"],
				];
				const option = options.find((item) => item[0] === value);
				return option ? option[1] : value;
			},
			select: [
				["alpine", strings["terminal:distro-alpine"] || "Alpine Linux (Default)"],
				["ubuntu", strings["terminal:distro-ubuntu"] || "Ubuntu (Optional)"],
			],
			info:
				strings["terminal:distro-info"] ||
				"Choose the Linux distribution for new terminal sessions. Ubuntu requires a separate download (~50 MB).",
			category: categories.session,
		},
		{
			key: "backup",
			text: strings.backup,
			info: strings["info-backup"],
			category: categories.maintenance,
			chevron: true,
		},
		{
			key: "restore",
			text: strings.restore,
			info: strings["info-restore"],
			category: categories.maintenance,
			chevron: true,
		},
		{
			key: "uninstall",
			text: strings.uninstall,
			info: strings["info-uninstall"],
			category: categories.maintenance,
			chevron: true,
		},
		{
			key: "ubuntu-install",
			text: strings["terminal:ubuntu-install"] || "Install Ubuntu",
			info:
				strings["terminal:ubuntu-install-info"] ||
				"Download and install an Ubuntu 24.04 LTS environment (~50 MB). Required to use Ubuntu as the terminal distro.",
			category: categories.maintenance,
			chevron: true,
		},
		{
			key: "ubuntu-uninstall",
			text: strings["terminal:ubuntu-uninstall"] || "Uninstall Ubuntu",
			info:
				strings["terminal:ubuntu-uninstall-info"] ||
				"Remove the Ubuntu Linux environment from this device.",
			category: categories.maintenance,
			chevron: true,
		},
	];

	return settingsPage(title, items, callback, undefined, {
		preserveOrder: true,
		pageClassName: "detail-settings-page",
		listClassName: "detail-settings-list",
		infoAsDescription: true,
		valueInTail: true,
	});

	/**
	 * Callback for settings page when an item is clicked
	 * @param {string} key
	 * @param {string} value
	 */
	async function callback(key, value) {
		switch (key) {
			case "all_file_access":
				if (ANDROID_SDK_INT >= 30) {
					system.isManageExternalStorageDeclared((boolStr) => {
						if (boolStr === "true") {
							system.requestStorageManager(console.log, console.error);
						} else {
							alert(strings["feature not available"]);
						}
					}, alert);
				} else {
					alert(strings["feature not available"]);
				}

				return;
			case "backup":
				terminalBackup();
				return;

			case "restore":
				terminalRestore();
				return;

			case "uninstall":
				const confirmation = await confirm(
					strings.confirm,
					strings["settings-info-terminal-uninstall"],
				);
				if (confirmation) {
					loader.showTitleLoader();
					Terminal.uninstall()
						.then(() => {
							loader.removeTitleLoader();
							alert(
								strings.success.toUpperCase(),
								`${strings["uninstalled successfully"]}.`,
							);
						})
						.catch((error) => {
							loader.removeTitleLoader();
							console.error("Terminal uninstall failed:", error);
							helpers.error(error);
						});
				}
				return;

			case "prootDebug":
				appSettings.update({
					terminalSettings: {
						...values.terminalSettings,
						[key]: value,
					},
				});
				Executor.setProotDebug(value);
				Executor.BackgroundExecutor.setProotDebug(value);
				break;

			case "distro":
				appSettings.update({
					terminalSettings: {
						...values.terminalSettings,
						distro: value,
					},
				});
				if (value === "ubuntu") {
					const isInstalled = await Terminal.isUbuntuInstalled();
					if (!isInstalled) {
						toast(
							strings["terminal:ubuntu-not-installed"] ||
								"Ubuntu is not installed. Use 'Install Ubuntu' below to set it up.",
						);
					}
				}
				return;

			case "ubuntu-install":
				ubuntuInstall();
				return;

			case "ubuntu-uninstall":
				ubuntuUninstall();
				return;

			default:
				appSettings.update({
					terminalSettings: {
						...values.terminalSettings,
						[key]: value,
					},
				});

				// Update any active terminal instances
				updateActiveTerminals(key, value);
				break;
		}
	}

	/**
	 * Creates a backup of the terminal installation
	 */
	async function terminalBackup() {
		try {
			// Ask user to select backup location
			const { url } = await FileBrowser("folder", strings["select folder"]);

			loader.showTitleLoader();

			// Create backup
			const backupPath = await Terminal.backup();
			await system.copyToUri(
				backupPath,
				url,
				"aterm_backup.tar",
				console.log,
				console.error,
			);
			loader.removeTitleLoader();
			alert(strings.success.toUpperCase(), `${strings["backup successful"]}.`);
		} catch (error) {
			loader.removeTitleLoader();
			console.error("Terminal backup failed:", error);
			toast(error.toString());
		}
	}

	/**
	 * Restores terminal installation
	 */
	async function terminalRestore() {
		try {
			await Executor.execute("rm -rf $PREFIX/aterm_backup.*");

			sdcard.openDocumentFile(
				async (data) => {
					loader.showTitleLoader();
					//this will create a file at $PREFIX/atem_backup.tar.tar
					await system.copyToUri(
						data.uri,
						cordova.file.dataDirectory,
						"aterm_backup.tar",
						console.log,
						console.error,
					);

					// Restore
					await Terminal.restore();

					//Cleanup restore file
					await Executor.execute("rm -rf $PREFIX/aterm_backup.*");

					loader.removeTitleLoader();
					alert(
						strings.success.toUpperCase(),
						`${strings["restored successfully"]}.`,
					);
				},
				toast,
				"application/x-tar",
			);
		} catch (error) {
			loader.removeTitleLoader();
			console.error("Terminal restore failed:", error);
			toast(error.toString());
		}
	}

	/**
	 * Installs Ubuntu Linux environment with a progress terminal
	 */
	async function ubuntuInstall() {
		try {
			const { TerminalManager } = await import(
				/* webpackChunkName: "terminal" */ "components/terminal"
			);

			// Check if already installed
			const alreadyInstalled = await Terminal.isUbuntuInstalled();
			if (alreadyInstalled) {
				const proceed = await confirm(
					strings.confirm,
					strings["terminal:ubuntu-already-installed"] ||
						"Ubuntu is already installed. Reinstall?",
				);
				if (!proceed) return;
			}

			// Create a progress terminal to show install output
			const terminalId = `ubuntu_install_${Date.now()}`;
			const terminalName = strings["terminal:ubuntu-install"] || "Install Ubuntu";

			const { TerminalComponent } = await import(
				/* webpackChunkName: "terminal" */ "components/terminal"
			);
			const terminalComponent = new TerminalComponent({ serverMode: false });

			const EditorFile = (await import("lib/editorFile")).default;
			const container = tag("div", {
				className: "terminal-content",
				id: `terminal-ubuntu-install`,
			});

			const terminalFile = new EditorFile(terminalName, {
				type: "terminal",
				content: container,
				tabIcon: "icon save_alt",
				render: true,
			});

			await new Promise((resolve) => setTimeout(resolve, 100));
			terminalComponent.mount(container);
			terminalComponent.write(
				"🚀 Installing Ubuntu 24.04 LTS...\r\nThis may take a few minutes.\r\n\r\n",
			);
			terminalFile.setCustomTitle(() => "Installing Ubuntu...");

			const installResult = await Terminal.installUbuntu(
				(message) => {
					const clean = message.replace(/^(stdout|stderr)\s+/, "") || "";
					terminalComponent.write(`${clean}\r\n`);
				},
				(...errorParts) => {
					const clean = errorParts
						.filter(Boolean)
						.join(" ")
						.replace(/^(stdout|stderr)\s+/, "");
					terminalComponent.write(`\x1b[31mError: ${clean}\x1b[0m\r\n`);
				},
			);

			if (installResult) {
				terminalComponent.write(
					"\r\n\x1b[32m✅ Ubuntu installed successfully!\x1b[0m\r\n",
				);
				terminalFile.setCustomTitle(() => "Ubuntu Installed");
				alert(strings.success.toUpperCase(), "Ubuntu installed successfully.");
			} else {
				const errorMsg = Terminal.lastInstallError || "Ubuntu installation failed.";
				terminalComponent.write(`\r\n\x1b[31m❌ ${errorMsg}\x1b[0m\r\n`);
				terminalFile.setCustomTitle(() => "Ubuntu Install Failed");
				alert(strings["error"], errorMsg);
			}
		} catch (error) {
			console.error("Ubuntu install failed:", error);
			helpers.error(error);
		}
	}

	/**
	 * Uninstalls Ubuntu Linux environment
	 */
	async function ubuntuUninstall() {
		const confirmation = await confirm(
			strings.confirm,
			strings["terminal:ubuntu-uninstall-confirm"] ||
				"Remove Ubuntu? All data inside the Ubuntu environment will be deleted.",
		);
		if (!confirmation) return;

		loader.showTitleLoader();
		try {
			await Executor.BackgroundExecutor.execute(
				"rm -rf $PREFIX/ubuntu $PREFIX/.ubuntu_configured $PREFIX/ubuntu.tar.gz",
			);
			loader.removeTitleLoader();
			alert(
				strings.success.toUpperCase(),
				strings["terminal:ubuntu-uninstalled"] || "Ubuntu has been removed.",
			);

			// If distro was set to ubuntu, switch back to alpine
			if (values.terminalSettings?.distro === "ubuntu") {
				appSettings.update({
					terminalSettings: {
						...values.terminalSettings,
						distro: "alpine",
					},
				});
				toast("Switched back to Alpine Linux.");
			}
		} catch (error) {
			loader.removeTitleLoader();
			console.error("Ubuntu uninstall failed:", error);
			helpers.error(error);
		}
	}
}

/**
 * Update active terminal instances with new settings
 * @param {string} key
 * @param {any} value
 */
export async function updateActiveTerminals(key, value) {
	// Find all terminal tabs and update their settings
	const terminalTabs = editorManager.files.filter(
		(file) => file.type === "terminal",
	);

	terminalTabs.forEach(async (tab) => {
		if (tab.terminalComponent) {
			const terminalOptions = {};

			switch (key) {
				case "fontSize":
					tab.terminalComponent.terminal.options.fontSize = value;
					break;
				case "fontFamily":
					// Load font if it's not already loaded
					try {
						fonts.injectFontFace(value);
						await fonts.loadFont(value);
					} catch (error) {
						console.warn(`Failed to load font ${value}:`, error);
					}
					tab.terminalComponent.terminal.options.fontFamily = value;
					tab.terminalComponent.terminal.refresh(
						0,
						tab.terminalComponent.terminal.rows - 1,
					);
					break;
				case "fontWeight":
					tab.terminalComponent.terminal.options.fontWeight = value;
					break;
				case "cursorBlink":
					tab.terminalComponent.terminal.options.cursorBlink = value;
					break;
				case "cursorStyle":
					tab.terminalComponent.terminal.options.cursorStyle = value;
					break;
				case "cursorInactiveStyle":
					tab.terminalComponent.terminal.options.cursorInactiveStyle = value;
					break;
				case "scrollback":
					tab.terminalComponent.terminal.options.scrollback = value;
					break;
				case "showScrollbar":
					tab.terminalComponent.updateScrollbarVisibility(value);
					break;
				case "tabStopWidth":
					tab.terminalComponent.terminal.options.tabStopWidth = value;
					break;
				case "convertEol":
					tab.terminalComponent.terminal.options.convertEol = value;
					break;
				case "letterSpacing":
					tab.terminalComponent.terminal.options.letterSpacing = value;
					break;
				case "theme":
					tab.terminalComponent.terminal.options.theme =
						TerminalThemeManager.getTheme(value);
					tab.terminalComponent.updateBackgroundColor();
					break;
				case "imageSupport":
					tab.terminalComponent.updateImageSupport(value);
					break;
				case "fontLigatures":
					tab.terminalComponent.updateFontLigatures(value);
					break;
			}
		}
	});
}
