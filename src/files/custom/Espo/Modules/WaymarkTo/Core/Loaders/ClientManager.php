<?php

declare(strict_types=1);

namespace Espo\Modules\WaymarkTo\Core\Loaders;

use Espo\Core\Container\Loader;
use Espo\Core\InjectableFactory;
use Espo\Modules\WaymarkTo\Core\Utils\ClientManager as WaymarkClientManager;

final class ClientManager implements Loader {
	public function __construct(
		private readonly InjectableFactory $injectableFactory
	) {}

	public function load(): WaymarkClientManager {
		return $this->injectableFactory->create(WaymarkClientManager::class);
	}

}