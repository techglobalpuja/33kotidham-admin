import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/store';
import { fetchCategories, createCategory } from '@/store/slices/categorySlice';
import { Category } from '@/types';

export const useCategories = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { categories, isLoading, error } = useSelector((state: RootState) => state.category);

  useEffect(() => {
    if (!categories) {
      dispatch(fetchCategories());
    }
  }, [dispatch, categories]);

  const createNewCategory = async (categoryData: Omit<Category, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const result = await dispatch(createCategory(categoryData)).unwrap();
      return result;
    } catch (err) {
      throw err;
    }
  };

  return {
    categories,
    isLoading,
    error,
    createNewCategory,
    refetchCategories: () => dispatch(fetchCategories()),
  };
};