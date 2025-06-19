<?php

declare(strict_types=1);

namespace Espo\Modules\WaymarkTo\Core\Di;

use Espo\Modules\WaymarkTo\Tools\Client\Helper;

trait ClientHelperSetter
{
    protected Helper $clientHelper;

    public function setClientHelper(Helper $clientHelper): void
    {
        $this->clientHelper = $clientHelper;
    }
}