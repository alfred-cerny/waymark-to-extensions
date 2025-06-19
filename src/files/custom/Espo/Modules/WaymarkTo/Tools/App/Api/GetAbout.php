<?php

namespace Espo\Modules\WaymarkTo\Tools\App\Api;

use Espo\Core\Api\Request;
use Espo\Core\Api\Response;
use Espo\Core\Api\ResponseComposer;
use Espo\Core\Utils\Config;
use Espo\Core\Utils\Resource\FileReader;
use Espo\Tools\App\Api\GetAbout as GetAboutBase;

class GetAbout extends GetAboutBase {
	public function __construct(
		private readonly Config\SystemConfig $systemConfig,
		private readonly Config              $config,
		protected FileReader                 $fileReader,
	) {
		parent::__construct($this->fileReader, $this->systemConfig);
	}

	public function process(Request $request): Response {
		$aboutContent = $this->config->get('aboutPageText');

		if (empty($aboutContent)) {
			return parent::process($request);
		}

		return ResponseComposer::json([
			'text' => $aboutContent,
			'version' => $this->config->get('version') ?? ''
		]);
	}

}
