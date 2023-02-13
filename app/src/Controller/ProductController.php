<?php

declare(strict_types=1);

namespace App\Controller;

use App\Service\ProductService;
use App\Service\RequestService;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;

class ProductController extends AbstractController
{
    public function __construct(
        private ProductService $productService,
        private RequestService $requestService,
    ){}

    /**
     *
     * @return Response
     */
    #[Route('/product', name: 'product')]
    public function index(): Response
    {
        return $this->render('page/table.html.twig', []);
    }

    #[Route('/product/upload', name: 'product.upload')]
    public function upload(Request $request): JsonResponse
    {
        return new JsonResponse([
            'status' => 'ok'
        ]);
    }

    /**
     * @throws \Exception
     */
    #[Route('/product/load', name: 'product.sort')]
    public function load(Request $request): JsonResponse
    {
        $params = $this->requestService->getTableQueryParameters($request);
        $products = $this->productService->getPaginatedProducts($params);

        $totalProducts = $products->count() ?? 0;

        $transformer = $this->productService->getPrepareProductData();

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