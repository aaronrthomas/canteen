package com.canteen.service;

import com.canteen.dto.OrderDto;
import com.canteen.entity.*;
import com.canteen.exception.ApiException;
import com.canteen.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class OrderService {

    private final OrderRepository orderRepository;
    private final FoodItemRepository foodItemRepository;
    private final UserRepository userRepository;
    private final PaymentRepository paymentRepository;

    private static final BigDecimal TAX_RATE = new BigDecimal("0.05"); // 5% GST

    @Transactional
    public OrderDto.Response createOrder(OrderDto.CreateRequest request, String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ApiException("User not found", HttpStatus.NOT_FOUND));

        // Calculate totals from DB prices (never trust frontend)
        BigDecimal subtotal = BigDecimal.ZERO;
        for (OrderDto.OrderItemRequest item : request.getItems()) {
            FoodItem food = foodItemRepository.findById(item.getFoodItemId())
                    .orElseThrow(() -> new ApiException("Food item not found: " + item.getFoodItemId(), HttpStatus.NOT_FOUND));
            if (!food.isAvailable()) {
                throw new ApiException(food.getName() + " is currently unavailable", HttpStatus.BAD_REQUEST);
            }
            subtotal = subtotal.add(food.getPrice().multiply(BigDecimal.valueOf(item.getQuantity())));
        }

        BigDecimal tax = subtotal.multiply(TAX_RATE).setScale(2, RoundingMode.HALF_UP);
        BigDecimal total = subtotal.add(tax);

        String orderNumber = "CN" + String.format("%04d", (int)(Math.random() * 9000 + 1000));

        Order order = Order.builder()
                .user(user)
                .subtotal(subtotal)
                .tax(tax)
                .totalAmount(total)
                .status(Order.OrderStatus.PENDING)
                .paymentStatus(Order.PaymentStatus.PAID) // Mock payment
                .paymentMethod(request.getPaymentMethod())
                .pickupTime(request.getPickupTime())
                .notes(request.getNotes())
                .orderNumber(orderNumber)
                .build();

        Order saved = orderRepository.save(order);

        // Add order items
        for (OrderDto.OrderItemRequest item : request.getItems()) {
            FoodItem food = foodItemRepository.findById(item.getFoodItemId()).get();
            OrderItem orderItem = OrderItem.builder()
                    .order(saved)
                    .foodItem(food)
                    .quantity(item.getQuantity())
                    .price(food.getPrice())
                    .build();
            saved.getItems().add(orderItem);
        }

        orderRepository.save(saved);

        // Create mock payment record
        Payment payment = Payment.builder()
                .order(saved)
                .amount(total)
                .method(request.getPaymentMethod())
                .status(Order.PaymentStatus.PAID)
                .transactionId("TXN" + UUID.randomUUID().toString().replace("-", "").substring(0, 12).toUpperCase())
                .build();
        paymentRepository.save(payment);

        return toResponse(saved);
    }

    public List<OrderDto.Response> getMyOrders(String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ApiException("User not found", HttpStatus.NOT_FOUND));
        return orderRepository.findByUserIdOrderByCreatedAtDesc(user.getId())
                .stream().map(this::toResponse).collect(Collectors.toList());
    }

    public OrderDto.Response getOrderById(Long id, String userEmail) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new ApiException("Order not found", HttpStatus.NOT_FOUND));
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ApiException("User not found", HttpStatus.NOT_FOUND));

        // Students can only see their own orders
        if (user.getRole() == User.Role.STUDENT && !order.getUser().getId().equals(user.getId())) {
            throw new ApiException("Access denied", HttpStatus.FORBIDDEN);
        }
        return toResponse(order);
    }

    public List<OrderDto.Response> getAllOrders() {
        return orderRepository.findAllByOrderByCreatedAtDesc()
                .stream().map(this::toResponse).collect(Collectors.toList());
    }

    @Transactional
    public OrderDto.Response updateOrderStatus(Long id, Order.OrderStatus newStatus) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new ApiException("Order not found", HttpStatus.NOT_FOUND));
        order.setStatus(newStatus);
        return toResponse(orderRepository.save(order));
    }

    public List<OrderDto.Response> getActiveOrders() {
        return orderRepository.findByStatusInOrderByCreatedAtDesc(
                List.of(Order.OrderStatus.PENDING, Order.OrderStatus.ACCEPTED,
                        Order.OrderStatus.PREPARING, Order.OrderStatus.READY))
                .stream().map(this::toResponse).collect(Collectors.toList());
    }

    public OrderDto.Response toResponse(Order order) {
        List<OrderDto.OrderItemResponse> items = order.getItems().stream()
                .map(item -> OrderDto.OrderItemResponse.builder()
                        .id(item.getId())
                        .foodItemId(item.getFoodItem().getId())
                        .foodItemName(item.getFoodItem().getName())
                        .foodItemImage(item.getFoodItem().getImageUrl())
                        .quantity(item.getQuantity())
                        .price(item.getPrice())
                        .total(item.getTotal())
                        .build())
                .collect(Collectors.toList());

        return OrderDto.Response.builder()
                .id(order.getId())
                .orderNumber(order.getOrderNumber())
                .userId(order.getUser().getId())
                .userName(order.getUser().getName())
                .items(items)
                .subtotal(order.getSubtotal())
                .tax(order.getTax())
                .totalAmount(order.getTotalAmount())
                .status(order.getStatus().name())
                .paymentStatus(order.getPaymentStatus().name())
                .paymentMethod(order.getPaymentMethod() != null ? order.getPaymentMethod().name() : null)
                .pickupTime(order.getPickupTime())
                .notes(order.getNotes())
                .createdAt(order.getCreatedAt())
                .updatedAt(order.getUpdatedAt())
                .build();
    }
}
