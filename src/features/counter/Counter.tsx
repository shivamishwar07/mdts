import { increment, decrement, incrementByAmount } from './counterSlice';
import { useAppDispatch, useAppSelector } from '../../store/hooks';

const Counter = () => {
    const count = useAppSelector((state:any) => state.counter.value);
    const dispatch = useAppDispatch();

    return (
        <div>
            <h2>Counter: {count}</h2>
            <button onClick={() => dispatch(decrement())}>-</button>
            <button onClick={() => dispatch(increment())}>+</button>
            <button onClick={() => dispatch(incrementByAmount(5))}>+5</button>
        </div>
    );
};

export default Counter;
