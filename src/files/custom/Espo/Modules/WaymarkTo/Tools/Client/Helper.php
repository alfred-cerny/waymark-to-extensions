<?php

declare(strict_types=1);

namespace Espo\Modules\WaymarkTo\Tools\Client;

use Espo\Core\Utils\ClientManager;
use Espo\Core\Utils\Config;
use Espo\Core\Utils\Json;
use Espo\Core\Utils\Language;
use Espo\Core\Utils\Metadata;
use Espo\Core\Utils\ThemeManager;
use Espo\Entities\Preferences;
use ReflectionMethod;
use RuntimeException;

class Helper {
	public function __construct(
		private readonly Metadata     $metadata,
		private readonly Config       $config,
		private readonly ThemeManager $themeManager,
		private readonly Preferences  $preferences
	) {}

	/**
	 * Prepare template variables for the client
	 *
	 * @param ClientManager $clientManager
	 * @param array<string, mixed> $vars
	 * @return array<string, mixed>
	 * @throws \JsonException
	 */
	public function prepareVars(ClientManager $clientManager, array $vars = []): array {
		$extensionMap = $this->metadata->get(['app', 'client', 'viewExtensions'], []);

		// Detect language - needed for {{lang}} in template
		$lang = Language::detectLanguage($this->config, $this->preferences)
			?? throw new RuntimeException('No language detected');

		$getAppTimestampMethod = new ReflectionMethod(ClientManager::class, 'getAppTimestamp');
		$appTimestamp = $getAppTimestampMethod->invoke($clientManager);

		$themeName = $this->themeManager->getName();
		$additionalThemeStyleSheets = $this->metadata->get(['themes', $themeName, 'additionalStyleSheets'], []);
		$getCssItemHtmlMethod = new ReflectionMethod(ClientManager::class, 'getCssItemHtml');

		$additionalThemeStyleSheetsHtml = implode('',
			array_map(
				static fn($file) => $getCssItemHtmlMethod->invoke($clientManager, $file, $appTimestamp),
				$additionalThemeStyleSheets
			)
		);

		// Provide essential template variables
		return array_merge($vars, [
			'lang' => strtok($lang, '_'), // Extract language code before underscore
			'extensionViews' => Json::encode($extensionMap),
			'additionalThemeStyleSheetsHtml' => $additionalThemeStyleSheetsHtml,
			'theme' => $vars['theme'] ?? Json::encode(null)
		]);
	}

}
