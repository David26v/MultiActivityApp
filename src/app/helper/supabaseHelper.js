import supabase from "../utils/supabaseClient";

export const insertData = async (table, data) => {
    try {
      const { data: insertedData, error } = await supabase
        .from(table)
        .insert([data])
        .select();
  
      if (error) throw error;
      if (!insertedData || insertedData.length === 0) {
        throw new Error("No data returned from the insert operation.");
      }
  
      return insertedData[0];
    } 
    catch (error) {
      console.error(`Error inserting data into ${table}:`, error.message);
      throw error;
    }
  };
  

  export const deleteData = async (table, id) => {
    try {
      const { error } = await supabase
        .from(table)
        .delete()
        .eq("id", id); 
  
      if (error) throw error;
  
      return true; 
    } 
    catch (error) {
      console.error(`Error deleting data from ${table}:`, error.message);
      throw error;
    }
  };


  export const fetchData = async (table, options = {}) => {
    try {
      let query = supabase.from(table).select("*");
  
      if (options.orderBy) {
        query = query.order(options.orderBy, { ascending: options.ascending ?? true });
      }
  
      if (options.filters) {
        options.filters.forEach(({ column, value, operator = "eq" }) => {
          query = query.filter(column, operator, value);
        });
      }
  
      const { data, error } = await query;
  
      if (error) throw error;
  
      return data.map((item) => ({
        ...item,
        modules: Array.isArray(item.modules) ? item.modules : [],
      }));
    } catch (error) {
      console.error(`Error fetching data from ${table}:`, error.message);
      throw error;
    }
  };
