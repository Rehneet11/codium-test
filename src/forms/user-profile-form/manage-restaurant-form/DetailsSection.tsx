import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useFormContext } from "react-hook-form";

const DetailsSection=()=>{
    const { control }=useFormContext();
    return (
        <div className="space-y-2">
            <div>
                <h2 className="text-2xl font-bold">Details</h2>
                <FormDescription>
                    Enter Details about your Restaurant
                </FormDescription>
            </div>
            <FormField control={control} name="restaurantName" 
            render={({ field })=> <FormItem>
                <FormLabel>Name</FormLabel>
                <FormControl>
                    <Input {...field} className="bg-slate-400"/>
                </FormControl>
                <FormMessage/>
            </FormItem>}/>
            <div className="flex gap-4">
            <FormField control={control} name="city" 
            render={({ field })=> <FormItem className="flex-1">
                <FormLabel>City</FormLabel>
                <FormControl>
                    <Input {...field} className="bg-slate-400"/>
                </FormControl>
                <FormMessage/>
            </FormItem>}/>
            <FormField control={control} name="state" 
            render={({ field })=> <FormItem className="flex-1">
                <FormLabel>State</FormLabel>
                <FormControl>
                    <Input {...field} className="bg-slate-400"/>
                </FormControl>
                <FormMessage/>
            </FormItem>}/>
            <FormField control={control} name="country" 
            render={({ field })=> <FormItem className="flex-1">
                <FormLabel>Country</FormLabel>
                <FormControl>
                    <Input {...field} className="bg-slate-400"/>
                </FormControl>
                <FormMessage/>
            </FormItem>}/>
            </div>
            <FormField control={control} name="deliveryPrice" 
            render={({ field })=> <FormItem className="max-w-[25%]">
                <FormLabel>Delivery Price(₹)</FormLabel>
                <FormControl>
                    <Input {...field} className="bg-slate-400" placeholder="49"/>
                </FormControl>
                <FormMessage/>
            </FormItem>}/>
            <FormField control={control} name="deliveryTime" 
            render={({ field })=> <FormItem className="max-w-[25%]">
                <FormLabel>Estimated Delivery Time(minutes)</FormLabel>
                <FormControl>
                    <Input {...field} className="bg-slate-400" placeholder="30"/>
                </FormControl>
                <FormMessage/>
            </FormItem>}/>
        </div>
    )
}
export default DetailsSection;