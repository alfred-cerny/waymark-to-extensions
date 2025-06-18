<?php

declare(strict_types=1);

namespace Espo\Modules\WaymarkTo\Core\Di;

use Espo\Modules\WaymarkTo\Tools\Client\Helper;

interface ClientHelperAware
{
    public function setClientHelper(Helper $clientHelper): void;
}