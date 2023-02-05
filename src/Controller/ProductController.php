<?php

declare(strict_types=1);

namespace App\Controller;

use App\Entity\Product;
use App\Repository\ProductRepository;
use App\Service\ProductService;
use App\Service\RequestService;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Annotation\Route;

class ProductController extends AbstractController
{
    public function __construct(
        private ProductService $productService,
        private RequestService $requestService,
    ){}

    #[Route('/product/load')]
    public function load(Request $request): JsonResponse
    {
        $params = $this->requestService->getTableQueryParameters($request);
        $products = $this->productService->getPaginatedProducts($params);

        $totalProducts = $products->count();

        $transformer = function (Product $product) {
            return [
                'id'            => $product->getId(),
                'name'          => $product->getName(),
                'description'   => $product->getDescription(),
                'weight'        => $product->getWeight(),
                'category'      => $product->getCategory()
            ];
        };

        return $this->json(
            [
                'data'            => array_map($transformer, (array) $products->getIterator()),
                'draw'            => $params->draw,
                'recordsTotal'    => $totalProducts,
                'recordsFiltered' => $totalProducts,
            ]
        );
    }
}