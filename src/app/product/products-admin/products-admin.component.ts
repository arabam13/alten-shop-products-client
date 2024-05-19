import { Component, OnInit } from "@angular/core";
import { ConfirmationService, MessageService } from "primeng/api";
import { Observable } from "rxjs";
import { Product } from "../model/product.model";
import { ProductService } from "../service/product.service";

@Component({
  selector: "app-products-admin",
  templateUrl: "./products-admin.component.html",
  styleUrls: ["./products-admin.component.scss"],
  providers: [ConfirmationService],
})
export class ProductsAdminComponent implements OnInit {
  products$: Observable<Product[]>;
  totalProducts$: Observable<number>;
  productsPerPage$: Observable<number>;

  pageSizeOptions = [10, 20, 30];
  productDialog: boolean = false;
  product: Pick<Product, "id" | "name" | "code">;
  selectedProducts!: Product[] | null;
  submitted: boolean = false;
  mode: "add" | "edit" = "add";

  constructor(
    private productService: ProductService,
    private confirmationService: ConfirmationService,
    private messageService: MessageService
  ) {}

  ngOnInit(): void {
    this.initObservables();
    this.productService.getProductsFromServer();
  }

  private initObservables() {
    this.products$ = this.productService.products$;
    this.totalProducts$ = this.productService.totalProducts$;
    this.productsPerPage$ = this.productService.productsPerPage$;
  }

  handlePageSizeChange(event: { page: number; rows: number }) {
    // console.log({ event });
    this.productService.getProductsFromServer(event.page + 1, event.rows);
  }

  openNew() {
    this.mode = "add";
    this.product = { id: 0, name: "", code: "" };
    this.submitted = false;
    this.productDialog = true;
  }

  hideDialog() {
    this.productDialog = false;
    this.submitted = false;
  }

  saveProduct(product: Pick<Product, "id" | "name" | "code">) {
    this.submitted = true;

    if (product.name?.trim() && product.code?.trim() && this.mode !== "add") {
      this.mode = "edit";
      this.productService.updateProductFromServer(product);
      this.messageService.add({
        severity: "info",
        summary: "Successful",
        detail: "Product Updated",
        life: 3000,
      });
    } else {
      this.mode = "add";
      if (
        (!product.name && this.submitted) ||
        (!product.code && this.submitted)
      ) {
        this.messageService.add({
          severity: "error",
          summary: "Error",
          detail: "Name or Code are required",
          life: 3000,
        });
        return;
      }
      this.productService.addProductFromServer(product);
      this.messageService.add({
        severity: "success",
        summary: "Successful",
        detail: "Product Created",
        life: 3000,
      });
    }

    this.productDialog = false;
  }

  editProduct(product: Product) {
    // console.log({ product });
    this.mode = "edit";
    this.product = { id: product.id, name: product.name, code: product.code };
    this.productDialog = true;
  }

  deleteProduct(product: Product) {
    this.confirmationService.confirm({
      message: "Are you sure you want to delete " + product.name + "?",
      header: "Confirm",
      icon: "pi pi-exclamation-triangle",
      accept: () => {
        this.productService.deleteProductFromServer(product);
        this.messageService.add({
          severity: "success",
          summary: "Successful",
          detail: "Product Deleted",
          life: 3000,
        });
      },
    });
  }
}
