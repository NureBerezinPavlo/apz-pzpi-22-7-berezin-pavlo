#include <iostream>
#include <memory>

// інтерфейс стратегії
class Strategy {
public:
    virtual int execute(int a, int b) const = 0;
    virtual ~Strategy() = default;
};

// конкретна стратегія — додавання
class AddStrategy : public Strategy {
public:
    int execute(int a, int b) const override {
        return a + b;
    }
};

// конкретна стратегія — віднімання
class SubtractStrategy : public Strategy {
public:
    int execute(int a, int b) const override {
        return a - b;
    }
};

 // контекст
class Calculator {
private:
    std::unique_ptr<Strategy> strategy;

public:
    // конструктор з ініціалізацією стратегії
    Calculator(std::unique_ptr<Strategy> s) : strategy(std::move(s)) {}

    // заміна стратегії під час виконання
    void setStrategy(std::unique_ptr<Strategy> s) {
        strategy = std::move(s);
    }

    int calculate(int a, int b) const {
        if (strategy) {
            return strategy->execute(a, b);
        }
        else {
            throw std::runtime_error("Strategy not set.");
        }
    }
};

int main() {
    // починаємо зі стратегії додавання
    Calculator calc(std::make_unique<AddStrategy>());
    std::cout << "5 + 3 = " << calc.calculate(5, 3) << std::endl;

    // переходимо до стратегїі віднісмання
    calc.setStrategy(std::make_unique<SubtractStrategy>());
    std::cout << "5 - 3 = " << calc.calculate(5, 3) << std::endl;

    return 0;
}