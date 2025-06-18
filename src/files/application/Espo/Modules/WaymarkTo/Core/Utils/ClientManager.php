<?php

declare(strict_types=1);

namespace Espo\Modules\WaymarkTo\Core\Utils;

use Espo\Core\Di;
use Espo\Core\Utils\ClientManager as BaseClientManager;
use Espo\Core\Utils\Client\RenderParams;
use Espo\Modules\WaymarkTo\Core\Di as WaymarkDi;

class ClientManager extends BaseClientManager implements
	Di\ConfigAware,
	Di\MetadataAware,
	WaymarkDi\ClientHelperAware {
	use Di\ConfigSetter;
	use Di\MetadataSetter;
	use WaymarkDi\ClientHelperSetter;

	protected string $mainHtmlFilePath = 'application/Espo/Modules/WaymarkTo/Resources/html/main.tpl';

	public function display(?string $runScript = null, ?string $htmlFilePath = null, array $vars = []): void {
		$htmlFilePath ??= $this->mainHtmlFilePath;

		$vars = $this->clientHelper->prepareVars($this, $vars);

		parent::display($runScript, $htmlFilePath, $vars);
	}

	public function render(RenderParams $params): string {
		$htmlFilePath = $this->mainHtmlFilePath;

		$vars = $this->clientHelper->prepareVars($this, []);

		return (new \ReflectionMethod(parent::class, 'renderInternal'))->invoke($this, $params->runScript, $htmlFilePath, $vars);
	}

}