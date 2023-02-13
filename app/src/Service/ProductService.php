<?php

declare(strict_types=1);

namespace App\Service;

use App\DataObjects\DataTableQueryParamsDto;
use App\Entity\Product;
use Doctrine\ORM\EntityManagerInterface;
use Doctrine\ORM\Tools\Pagination\Paginator;

class ProductService
{
    public function __construct(private EntityManagerInterface $entityManager)
    {
    }

    public function getPaginatedProducts(DataTableQueryParamsDto $dto): Paginator
    {
        $query = $this->entityManager
            ->getRepository(Product::class)
            ->createQueryBuilder('c')
            ->setFirstResult($dto->start)
            ->setMaxResults($dto->length);

        $orderBy = in_array($dto->orderBy, ['name', 'description', 'weight', 'category']) ? $dto->orderBy : 'id';
        $orderDir = strtolower($dto->orderDir) === 'asc' ? 'asc' : 'desc';

        if (! empty($dto->searchTerm)) {
            $query->where('c.name LIKE :name')->setParameter('name', '%' . addcslashes($dto->searchTerm, '%_') . '%');
        }

        $query->orderBy('c.' . $orderBy, $orderDir);

        return new Paginator($query);
    }


    public function getPrepareProductData(): \Closure
    {
        return function (Product $product) {
            return [
                'id'            => $product->getId(),
                'name'          => $product->getName(),
                'description'   => $product->getDescription(),
                'weight'        => $product->getWeight(),
                'category'      => $product->getCategory()
            ];
        };
    }

}