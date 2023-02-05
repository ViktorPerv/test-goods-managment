<?php

declare(strict_types=1);

namespace App\DataObjects;

class DataTableQueryParamsDto
{

    /**
     * @param  int  $start
     * @param  int  $length
     * @param  string  $orderBy
     * @param  string  $orderDir
     * @param  int  $draw
     */
    public function __construct(
        public int $start,
        public int $length,
        public string $orderBy,
        public string $orderDir,
        public int $draw
    ) {
    }
}