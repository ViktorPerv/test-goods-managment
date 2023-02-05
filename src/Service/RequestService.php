<?php

declare(strict_types=1);

namespace App\Service;

use App\DataObjects\DataTableQueryParamsDto;
use Symfony\Component\HttpFoundation\Request;

class RequestService
{

    public function getTableQueryParameters(Request $request): DataTableQueryParamsDto
    {
        $params = $request->query->all();

        $orderBy = $params['columns'][$params['order'][0]['column']]['data'];
        $orderDir = $params['order'][0]['dir'];

        return new DataTableQueryParamsDto(
            (int) $params['start'],
            (int) $params['length'],
            $orderBy,
            $orderDir,
            (int) $params['draw']
        );
    }
}