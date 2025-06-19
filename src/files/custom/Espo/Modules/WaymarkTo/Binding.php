<?php

declare(strict_types=1);

namespace Espo\Modules\WaymarkTo;

use Espo\Core\Binding\Binder;
use Espo\Core\Binding\BindingProcessor;
use Espo\Modules\WaymarkTo\Core\Utils\ClientManager;
use Espo\Modules\WaymarkTo\Tools\Client\Helper as ClientHelper;

class Binding implements BindingProcessor {
	public function process(Binder $binder): void {
		$binder->bindService(ClientManager::class, 'clientManager');
		$binder->bindService(ClientHelper::class, 'clientHelper');
	}

}