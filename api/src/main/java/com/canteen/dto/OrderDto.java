package com.canteen.dto;

import com.canteen.entity.Order;
import jakarta.validation.constraints.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public class OrderDto {

    @Getter @Setter
    public static class CreateRequest {
        @NotEmpty(message = "Order must have at least one item")
        private List<OrderItemRequest> items;

        @NotNull(message = "Payment method is required")
        private Order.PaymentMethod paymentMethod;

        private String pickupTime;
        private String notes;
    }

    @Getter @Setter
    public static class OrderItemRequest {
        @NotNull
        private Long foodItemId;

        @NotNull @Min(1)
        private Integer quantity;
    }

    @Getter @Setter @Builder @NoArgsConstructor @AllArgsConstructor
    public static class Response {
        private Long id;
        private String orderNumber;
        private Long userId;
        private String userName;
        private List<OrderItemResponse> items;
        private BigDecimal subtotal;
        private BigDecimal tax;
        private BigDecimal totalAmount;
        private String status;
        private String paymentStatus;
        private String paymentMethod;
        private String pickupTime;
        private String notes;
        private LocalDateTime createdAt;
        private LocalDateTime updatedAt;
    }

    @Getter @Setter @Builder @NoArgsConstructor @AllArgsConstructor
    public static class OrderItemResponse {
        private Long id;
        private Long foodItemId;
        private String foodItemName;
        private String foodItemImage;
        private Integer quantity;
        private BigDecimal price;
        private BigDecimal total;
    }

    @Getter @Setter
    public static class StatusUpdateRequest {
        @NotNull
        private Order.OrderStatus status;
    }
}
